<?php

if( !class_exists('micro_time') ) { die('can\'t function without micro_time class'); }
if( !class_exists('handle_php_errors') ) { die('can\'t function without handle_php_errors class'); }

class regex_tester {
	protected $error_message = '';
	protected $find = '';
	protected $id = 0;
	protected $ok = true;
	protected $replace = '';
	protected $regex = '';
	protected $matched = false;

	static protected $handle_errors = null;
	static protected $delim_open = '`';
	static protected $delim_close = '`';

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

	public static function get_obj( $regex_pair, $do_replace = false )
	{
		if( self::$handle_errors === null )
		{
			self::$handle_errors = new handle_php_errors();
		}

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
			debug('No there wasn\'t an error');
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

	public function get_errors()
	{
		return array( 'regexID' => $this->id , 'message' => $this->error_message );
	}

	public function process($sample)
	{
	}

	public function has_errors()
	{
		if( $this->error_message !== '')
		{
			return true;
		}
		return false;
	}

	public function something_matched()
	{
		return $this->matched;
	}

	static public function set_delim($open,$close)
	{
		$tmp = array('open','close');
		for( $a = 0 ; $a < 2 ; $a += 1 )
		{
			if( is_string(${$tmp[$a]}) && strlen(${$tmp[$a]}) === 1 && preg_match('`^[^a-z0-9\s]$`', ${$tmp[$a]}) )
			{
				$var = 'delim_'.$tmp[$a];
				self::$$var = $$tmp[$a];
			}
			else
			{
				throw new Exception($tmp[$a].' delimiter must be a single non-alpha-numeric, non-white-space character');
			}
		}
	}
}



// ==================================================================



class regex_tester_match extends regex_tester
{
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
		debug($sample, $this->regex, $this->replace);
		if( preg_match_all( $this->regex , $sample , $matches , PREG_SET_ORDER) )
		{
			for( $a = 0 ; $a < count($matches) ; $a += 1 )
			{
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
	public function process($sample)
	{
		$sample = preg_replace($this->regex, $this->replace,$sample);
		return array( 'output' => array() , 'sample' => $sample );

	}
}



// ==================================================================



class regex_tester_error extends regex_tester
{
	protected $ok = false;
	protected $error_processed = false;
	protected $error_parts = array('good' => '', 'problem' => '', 'bad' => '');

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

	public function process($sample)
	{
		return array( 'output' => array( 'regexID' => $this->id , 'ok' => false ) , 'sample' => $sample );
	}

	public function has_error()
	{
		return true;
	}

/**
 * @method errors() returns all error information generated by the
 * object, including input and preg errors
 *
 * @param void
 * @return array an array of strings with error messages.
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
			return str_replace('preg_match() [function.preg-match]: ','',strip_tags($error));
		}
		return $error;
	}
}