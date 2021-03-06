<?php

if( !class_exists('micro_time') ) { die('can\'t function without micro_time class'); }

class regex_tester {
	protected $error_message = '';
	protected $find = '';
	protected $id = 0;
	protected $ok = true;
	protected $replace = '';
	protected $regex = '';
	protected $matched = false;

	static protected $delim_open = '`';
	static protected $delim_close = '`';
	static protected $match_len = 300;
	static protected $sample_len = 300;

	/**
	 * @private
	 * @param [mixed] $id                supplied identifier for this regex
	 * @param [string] $find             raw regular expression to be tested
	 * @param [string] $modifiers        alpha characters
	 * @param [string] [$replace = '']   replacement pattern
	 * @param [array] [$errors = false]  list of errors for this regex.
	 */
	protected function __construct( $id , $find , $modifiers , $replace = '' , $errors = false )
	{
		$this->id = $id;
		$this->find = $find;
		$this->replace = $replace;
		$this->modifiers = $modifiers;
		$this->regex = self::$delim_open.$this->find.self::$delim_close.$this->modifiers;

		if( is_string($errors) && $errors !== '' )
		{
			$this->error_message = $errors;
		}
	}

	/**
	 * @function get_errors() returns information about the errors
	 * encounted before actually testing the supplied regular
	 * expression.
	 *
	 * @return [array] associative array
	 */
	public function get_errors()
	{
		return array( 'regexID' => $this->id , 'message' => $this->error_message );
	}

	/**
	 * @function process() applies regular expresion to sample string.
	 * (In this case it actually doesn't do anything to the string.)
	 * @param  [string] $sample sample content supplied by user
	 * @return [array] 2D associative array
	 */
	public function process($sample)
	{
		return array( 'output' => array( 'regexID' => $this->id , 'ok' => false ) , 'sample' => $sample );
	}

	/**
	 * @function has_error() test whether there was an error with the
	 * supplied regex
	 *
	 * @param [void]
	 * @return [boolean] always TRUE for this object
	 */
	public function has_errors()
	{
		if( $this->error_message !== '')
		{
			return true;
		}
		return false;
	}

	/**
	 * @function something_matched() whether or not this regex matched
	 * anything in any sample tested.
	 * @return [boolean] TRUE if something was matched, FALSE otherwise
	 */
	public function something_matched()
	{
		return $this->matched;
	}

	public function get_regex()
	{
		return $this->regex;
	}


	/**
	 * @function get_obj() factory function - returns the appropriate
	 * type of regex_tester object based on whether the regex was
	 * valid and whether the user wanted to match or replace sample.
	 *
	 * @param  [std_obj] $regex_pair  individual regex pair oject
	 *                                from output of json_decode
	 *                                supplied in request
	 * @param  [boolean] [$do_replace = false] whether or not user
	 *                                want to match or replace
	 * @return [regex_tester] regex_tester_match, regex_tester_replace
	 *                                or regex_tester_error object
	 */
	public static function get_obj( $regex_pair, $do_replace = false )
	{

		$error_message = '';
		if( !is_numeric($regex_pair->id) && !is_string($regex_pair->id) )
		{
			throw new Exception('regex_tester::get_obj() expects first parameter to be a number or a string. '.gettype($id).' given');
		}
		if( !is_string($regex_pair->find) || $regex_pair->find === '' ) {
			throw new exception('regex_tester::__construct() expects second param $find to be a non empty string');
		}
		if( !is_string($regex_pair->modifiers) )
		{
			throw new Exception('regex_tester::__construct() expects third param $modifiers to be a string');
		}
		if( preg_match('`[^eimsuxADJSUX]`', $regex_pair->modifiers) )
		{
			$error_message = "\$modifiers can containing no more than one of each of the following characters: \"e\", \"i\", \"m\", \"s\", \"u\", \"x\", \"A\", \"D\", \"j\", \"S\", \"U\" and/or \"X\"";
			$modifiers = preg_replace( '`[^eimsuxADJSUX]+`' , '' , $regex_pair->modifiers );
		}
		else
		{
			$modifiers = $regex_pair->modifiers;
		}

		if( !is_string($regex_pair->replace) )
		{
			throw new Exception('regex_tester::__construct() expects fourth param $replace to be a string');
		}


		// ==========================================================
		// START: managing PHP errors

		if($old_track_errors = ini_get('track_errors'))
		{
			$old_php_errormsg = isset($php_errormsg)?$php_errormsg:false;
		}
		else
		{
			ini_set('track_errors' , 1);
		}
		unset($php_errormsg);

		$display_errors = ini_get('display_errors');
		ini_set('display_errors',0);

		$html_errors = ini_get('html_errors');
		ini_set('html_errors','false');

		// ----------------------------------------------------------
		// START: doing the do

		preg_match(self::$delim_open.$regex_pair->find.self::$delim_close.$modifiers,'');


		if( isset($php_errormsg) )
		{
			$error = $php_errormsg;
			unset( $php_errormsg );
		}
		else
		{
			$error = false;
		}

		// END: doing the do
		// ----------------------------------------------------------

		ini_set('display_errors',$display_errors);
		ini_set('html_errors',$html_errors);

		if($old_track_errors)
		{
			$php_errormsg = isset($old_php_errormsg)?$old_php_errormsg:false;
		}
		else
		{
			ini_set('track_errors' , 0);
		}

		// END: managing PHP errors
		// ==========================================================

		if( $error !== false )
		{
			return new regex_tester_error( $regex_pair->id, $regex_pair->find, $modifiers, $regex_pair->replace , array($error_message,$error) );
		}

		if( $do_replace === true )
		{
			return new regex_tester_replace( $regex_pair->id, $regex_pair->find, $modifiers, $regex_pair->replace , $error_message );
		}
		else
		{
			return new regex_tester_match( $regex_pair->id, $regex_pair->find, $modifiers, $regex_pair->replace , $error_message );
		}
	}

	/**
	 * @function set_delim() tests and sets open and close delimiters
	 * for regular expression.
	 * @param [string] $delim single non-alpha-numeric, non-white-space character
	 * @param [string] $which ['open' or 'close']
	 */
	static public function set_delim($delim,$which)
	{
		if( $which !== 'open')
		{
			$which = 'close';
		}

		if( is_string($delim) && strlen($delim) === 1 && preg_match('`^[^a-z0-9\s]$`', $delim) )
		{
			$var = 'delim_'.$which;
			self::$$var = $delim;
		}
		else
		{
			throw new Exception($which.' delimiter must be a single non-alpha-numeric, non-white-space character');
		}
		return true;
	}

	static public function validate_delim_pair()
	{
		if( ( self::$delim_open === '(' && self::$delim_close !== ')' ) || ( self::$delim_open === '[' && self::$delim_close !== ']' ) || ( self::$delim_open === '{' && self::$delim_close !== '}' ) || ( self::$delim_open === '[' && self::$delim_close !== ']' ) )
		{
			throw new Exception('You have supplied a bracket as an opening delimiter but your closing delimiter is not its mirror.');
		}
		elseif( self::$delim_open !==  self::$delim_close )
		{
			throw new Exception('Your opening and closing delimiters are not the same.');
		}
		return true;
	}

	/**
	 * @function set_len() tests and sets open and close delimiters
	 * for regular expression.
	 * @param [string] $open  single non-alpha-numeric, non-white-space character
	 * @param [string] $close single non-alpha-numeric, non-white-space character
	 */
	static public function set_len($len,$which)
	{
		if( $which !== 'sample' )
		{
			$which = 'match';
		}
		if( $len !== false )
		{
			if( is_numeric($len) && $len > 6 )
			{
				settype($len,'integer');
				self::${$which.'_len'} = $len;
			}
			else
			{
				throw new Exception($which.' length must be an integer, greater than six.');
			}
		}
	}
}



// ==================================================================



class regex_tester_match extends regex_tester
{

	/**
	 * @function truncate() takes the a single array of strings (whole
	 * match & sub patterns) generated preg_match_all() and truncates
	 * each string in the array so they do not excede the maximum length
	 * @param  [array] $input list of strings
	 * @return [array] list of strings whose length does not excede
	 *                 the maximum length
	 */
	private function truncate($input)
	{
		for( $a = 0 ; $a < count($input) ; $a += 1 )
		{
			$input[$a] = substr( $input[$a] , 0 , self::$match_len );
		}
		return $input;
	}

	/**
	 * @function process() applies regular expresion to sample string.
	 * (In this case it actually does a preg_match_all() to the string
	 *  before doing a preg_replace() on the string.)
	 *
	 * @param  [string] $sample sample content supplied by user
	 * @return [array]  multi-dimensional associative array with all the
	 *                  matched patterns and subpatterns being returned
	 */
	public function process($sample)
	{
		$micro = micro_time::get_obj();
		$output = array(
			 'regexID' => $this->id
			,'ok' => true
			,'matched' => false
			,'matches' => array()
			,'seconds' => 0
		);

		if( preg_match_all( $this->regex , $sample , $matches , PREG_SET_ORDER) )
		{
			for( $a = 0 ; $a < count($matches) ; $a += 1 )
			{
				$matches[$a] = $this->truncate($matches[$a]);
				$output['matches'][] = array( 'wholeMatch' => array_shift($matches[$a]) , 'subPatterns' => $matches[$a] );
			}

			$this->matched = true;
			$output['matched'] = true;
			$start = microtime();
			$sample = preg_replace($this->regex,$this->replace,$sample);
			$output['seconds'] = $micro->mt_subtract($start,microtime());
		}
		return array( 'output' => $output, 'sample' => $sample );
	}
}



// ==================================================================



class regex_tester_replace extends regex_tester
{

	/**
	 * @function process() applies regular expresion to sample string.
	 * (In this case it only does preg_replace() to the sample)
	 * @param  [string] $sample sample content supplied by user
	 * @return [array] associative array
	 */
	public function process($sample)
	{
		$tmp = preg_replace( $this->regex , $this->replace , $sample );
		if( $tmp !== $sample )
		{
			$this->matched = true;
		}
		return array( 'output' => array() , 'sample' => $tmp );
	}
}



// ==================================================================



class regex_tester_error extends regex_tester
{
	protected $ok = false;
	protected $error_processed = false;
	protected $preg_error = '';
	protected $error_parts = array('good' => '', 'problem' => '', 'bad' => '');

	/**
	 * @private
	 * @param [mixed] $id                supplied identifier for this regex
	 * @param [string] $find             raw regular expression to be tested
	 * @param [string] $modifiers        alpha characters
	 * @param [string] [$replace = '']   replacement pattern
	 * @param [array] [$errors = false]  list of errors for this regex.
	 */
	protected function __construct( $id , $find , $modifiers , $replace = '' , $errors = false )
	{
		$this->id = $id;
		$this->find = $find;
		$this->replace = $replace;
		$this->regex = self::$delim_open.$this->find.self::$delim_close.$modifiers;

		$this->error_message = array();

		for( $a = 0 ; $a < count($errors) ; $a += 1 )
		{
			if( $errors[$a] !== '' )
			{
				$this->error_message[] = $errors[$a];
			}
		}
	}

	/**
	 * @function get_errors() returns information about the errors
	 * encounted when doing a preg_match() using the supplied regular
	 * expression.
	 *
	 * @return [array] 2D associative array
	 */
	public function get_errors()
	{
		$message = array();
		$output = array( 'regexID' => $this->id , 'message' => array() );
		$problem_parts = array();
		$sep = '';

		$a = ( count($this->error_message) - 1 );
		$this->error_message[$a] = $this->parse_errors($this->error_message[$a]);

		for( $a = 0 ; $a < count($this->error_message) ; $a += 1 ) {
			$output['message'][] = $this->error_message[$a];
		}

		if( $this->error_parts['problem'] !== '' && $this->error_parts['error'] !== '' )
		{
			$output['problemParts'] = array(
				 'good' => $this->error_parts['good']
				,'problem' => $this->error_parts['problem']
				,'error' => $this->error_parts['error']
			);
		}

		return $output;
	}

	/**
	 * @function process() applies regular expresion to sample string.
	 * (In this case it actually doesn't do anything to the string.)
	 * @param  [string] $sample sample content supplied by user
	 * @return [array] 2D associative array
	 */
	public function process($sample)
	{
		if( !is_string($sample) )
		{
			throw new Exception(get_class($this).'::process() expects only parameter to be a string. '.gettype($sample).' given.');
		}
		return array( 'output' => array( 'regexID' => $this->id , 'ok' => false ) , 'sample' => $sample );
	}

	/**
	 * @function has_error() test whether there was an error with the
	 * supplied regex
	 *
	 * @param [void]
	 * @return [boolean] always TRUE for this object
	 */
	public function has_error()
	{
		return true;
	}

	/**
	 * @function errors() returns all error information generated by the
	 * object, including input and preg errors
	 *
	 * parses the error message to extract more info from it and try
	 * and break up the regular expression into good, problem and
	 * error parts to help user identify where s/he went wrong.
	 *
	 * @param [string] $error ($php_errormsg) generated by preg_match()
	 *
	 * @return [string] cleaned up version of error messages.
	 */
	private function parse_errors($error)
	{
		if( $this->error_processed === false )
		{
			if( preg_match('/missing (?:terminating )?([\]\}\)]) .*? offset ([0-9]+)/' , $error , $matches ) )
			{
				$bracket = $matches[1];
				$offset = $matches[2] += 1;
				preg_match('/^(.{'.$offset.'})(.*)$/is' , $this->regex , $matches );
				$head = $matches[1];
				$tail = $matches[2];
				switch($bracket)
				{
					case ']': $bracket_ = '[';
						break;
					case '}': $bracket_ = '{';
						break;
					case ')': $bracket_ = '(';
						break;
					case '[': $bracket_ = ']';
						break;
					case '{': $bracket_ = '}';
						break;
					case '(': $bracket_ = ')';
						break;
				}
				preg_match( '/^(.*?\\'.$bracket_.')(.*)$/is' , $head , $matches );
				$this->error_parts['good'] = $matches[1];
				$this->error_parts['problem'] = $matches[2];
				$this->error_parts['error'] = $tail;
			}
			elseif( preg_match('/Unknown modifier/is' , $error ) )
			{
				preg_match('/^./',$this->find,$matches);
				switch($matches[0])
				{
					case '(': $wrap = ')';
						break;
					case '[': $wrap = ']';
						break;
					case '{': $wrap = '}';
						break;
					case '<': $wrap = '>';
						break;
					default: $wrap = $matches[0];
				}
				$regex = '/^.(.*?)(?<!\\\\)(\\'.$wrap.')(.*)$/s';
				preg_match($regex,$this->find,$matches);
				$this->error_parts['good'] = $matches[1];
				$this->error_parts['problem'] = $matches[2];
				$this->error_parts['error'] = $matches[3];
			}
			elseif( preg_match('/at offset ([0-9]+)/is' , $error , $matches ) )
			{
				$offset = ++$matches[1];
				preg_match('/^(.{'.$offset.'})(.)(.*)$/is' , $this->find , $matches );
				$this->error_parts['good'] = $matches[1];
				$this->error_parts['problem'] = $matches[2];
				$this->error_parts['error'] = $matches[3];
			}
			elseif( preg_match('/lookbehind assertion is not fixed length at offset ([0-9]+)/is' , $error , $matches ) )
			{
				$offset = ++$matches[1];
				preg_match('/^(.{'.$offset.'})(.*)$/is' , $this->find , $matches );
				$head = $matches[1];
				$tail = $matches[2];
				preg_match('/^(.*)(\(\?<[=!].*)/is' , $head , $matches );
				$this->error_parts['good'] = $matches[1];
				$this->error_parts['problem'] = $matches[2];
				$this->error_parts['error'] = $tail;
			}
			elseif( preg_match('/No ending (?:matching )?delimiter \'([^\']+)\' found/is' , $error , $matches ) )
			{
				$delim = $matches[1];
				preg_match('/^(.)(.*)$/is' , $this->find , $matches);
				$this->highlight = '<span class="ok">'.$this->h($matches[1]).'</span><span class="error">'.$this->h($matches[2]).'</span>';
				$this->error_parts['good'] = $matches[1];
				$this->error_parts['problem'] = '';
				$this->error_parts['error'] = $matches[2];
			}
			elseif( preg_match('/Delimiter must not be alphanumeric or backslash/i', $error , $matches ) )
			{
				preg_match('/^(.)(.*)$/is' , $this->find , $matches);
				$this->error_parts['good'] = $matches[1];
				$this->error_parts['problem'] = '';
				$this->error_parts['error'] = $matches[2];
			}
			else
			{
//				die("PREG encountered an error I couldn't recognise (or at least haven't seen yet): \"$error\"");
			}

			$this->error_processed = true;
			$this->preg_error = str_replace('preg_match() [function.preg-match]: ','',strip_tags($error));
			return $this->preg_error;
		}
		return $this->preg_error;
	}
}