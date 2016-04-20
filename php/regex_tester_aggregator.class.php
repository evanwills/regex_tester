<?php

class regex_tester_aggregator
{
	protected $jQuery_callback = false;
	protected $json = null;
	protected $errors = array();
	protected $success = false;
	protected $do_replace = false;
	protected $regex_pairs = array();
	protected $regex_errors = array();
	protected $output = array();
	protected $matched = false;

	public function __construct($json_str)
	{
		if( !is_string($json_str) || '' === trim($json_str) )
		{
			$this->errors[] ='JSON string must be a non-empty string.';
			return;
		}
		$this->json = json_decode($json_str);
		if( $this->json === null )
		{
			$this->errors[] ='JSON string must be valid JSON format.';
			return;
		}

		// ================================================

		if( !property_exists( $this->json , 'regexPairs') || !is_array($this->json->regexPairs) || empty($this->json->regexPairs) )
		{
			$this->errors[] = 'JSON object must contain a "regexPairs" property that is a non-empty array.';
			return;
		}
		else
		{
			for( $a = 0 ; $a < count($this->json->regexPairs) ; $a += 1 )
			{
				if( !is_object($this->json->regexPairs[$a]) ||
				    !property_exists( $this->json->regexPairs[$a] , 'id') ||
				    !property_exists( $this->json->regexPairs[$a] , 'find' ) ||
				    !property_exists( $this->json->regexPairs[$a] , 'modifiers' ) ||
				    !property_exists( $this->json->regexPairs[$a] , 'replace' ) )
				{
					$this->errors[] = 'Each regex pair must be an object containing the following properties: "id", "find", "modifiers" & "replace". Regex pair '.$a.' did not meet this requirement.';
					return;
				}
			}
		}

		// ================================================

		$samples_non_empty = false;
		if( !property_exists( $this->json , 'samples' ) || !is_array($this->json->samples) || count($this->json->samples) < 1 )
		{
			$this->errors[] = 'JSON object must contain a "samples" property that must be a non-empty array.';
			return;
		}
		else
		{
			for( $a = 0 ; $a < count($this->json->samples) ; $a += 1 )
			{
				if( !is_string($this->json->samples[$a]) && !is_numeric($this->json->samples[$a]) )
				{
					$this->errors[] = 'Each sample must be a string or numeric value. Sample '.$a.' was not either.';
					return;
				}
				elseif( $this->json->samples[$a] !== '' )
				{
					$samples_non_empty = true;
				}
			}
		}

		// ================================================

		// We have a minimum viable request.
		$this->success = true;

		// ================================================

		if( isset($this->json->doReplace) && $this->json->doReplace === true )
		{

			if( $samples_non_empty === false )
			{
				$this->errors[] = 'You want to do a find and replace but you haven\'t provided anything to find. (We\'ll just validate the regexes)';
			}
			else
			{
				$this->do_replace = true;
			}
		}

		// ================================================

		if( property_exists( $this->json , 'delimOpen' ) )
		{
			try
			{
				regex_tester::set_delim($this->json->delimOpen,'open');
			}
			catch(Exception $e)
			{
				$this->errors[] = $e->getMessage();
			}
		}
		if( property_exists( $this->json , 'delimClose' ) )
		{
			try
			{
				regex_tester::set_delim($this->json->delimClose,'close');
			}
			catch(Exception $e)
			{
				$this->errors[] = $e->getMessage();
			}
		}
		try
		{
			regex_tester::validate_delim_pair();
		}
		catch(Exception $e)
		{
			$this->errors[] = $e->getMessage();
		}

		// ================================================

		$match_len = property_exists($this->json, 'matchResultLen')?$this->json->matchResultLen:false;
		try
		{
			regex_tester::set_len($match_len, 'match');
		}
		catch(Exception $e)
		{
			$this->errors[] = $e->getMessage();
		}
		$sample_len = property_exists($this->json, 'sampResultLen')?$this->json->sampResultLen:false;
		try
		{
			regex_tester::set_len( $sample_len, 'sample');
		}
		catch(Exception $e)
		{
			$this->errors[] = $e->getMessage();
		}
	}

	public function validate_regexes()
	{
		for( $a = 0 ; $a < count($this->json->regexPairs) ; $a += 1 )
		{
			$tmp = regex_tester::get_obj($this->json->regexPairs[$a], $this->json->doReplace);

			$this->regex_pairs[] = $tmp;
			if( $tmp->has_errors() )
			{
				$this->regex_errors[] = $tmp->get_errors();
			}
		}
	}

	public function process_samples()
	{
		for( $a = 0 ; $a < count($this->json->samples) ; $a += 1 )
		{
			$tmp = array( 'sampleID' => $a, 'sampleMatches' => array() );

			for( $b = 0 ; $b < count($this->regex_pairs) ; $b += 1 )
			{
				$tmp_inner = $this->regex_pairs[$b]->process($this->json->samples[$a]);
				$tmp['sampleMatches'][] = $tmp_inner['output'];
				$this->json->samples[$a] = $tmp_inner['sample'];
				if( $this->matched === false )
				{
					$this->matched = $this->regex_pairs[$b]->something_matched();
				}
			}
			if( $this->do_replace === true )
			{
				$tmp = $this->json->samples[$a];
			}
			$this->output[] = $tmp;
		}
		return $this->matched;
	}

	public function all_good()
	{
		return $this->success;
	}

	public function get_output()
	{
		if( $this->success === false )
		{
			return array(
				 'success' => false
				,'message' => $this->errors
			);
		}
		else
		{
			if( $this->matched === false && $this->do_replace === true )
			{
				// The aim was to do a find & replace but nothing was
				// found so nothing was replaced. Therefore the client
				// already has what we were going to send them. We're
				// going to save bandwidth by not sending them stuff
				// they don't need
				$this->output = array();
			}
			return array(
				 'success' => true
				,'message' => $this->errors
				,'matched' => $this->matched
				,'regexErrors' => $this->regex_errors
				,'samples' => $this->output
				,'doReplace' => $this->do_replace
			);
		}
	}
}