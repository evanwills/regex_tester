<?php

header('content-type:application/json');


// ==================================================================
// START: debug include

if(!function_exists('debug'))
{
	if(isset($_SERVER['HTTP_HOST'])){ $path = $_SERVER['HTTP_HOST']; $pwd = dirname($_SERVER['SCRIPT_FILENAME']).'/'; }
	else { $path = $_SERVER['USER']; $pwd = $_SERVER['PWD'].'/'; };
	if( substr_compare( $path , '192.168.' , 0 , 8 ) == 0 ) { $path = 'localhost'; }
	switch($path)
	{
		case '192.168.18.128':	// work laptop (debian)
		case '192.168.1.128':	// raspberry Pi
		case 'antechinus':	// work laptop (debian)
		case 'evan':		// home laptop
		case 'wombat':	$root = '/var/www/html/';	$inc = $root.'includes/'; $classes = $cls = $root.'classes/'; break; // home laptop

		case 'localhost':	$root = 'c:/wamp/www/';	$inc = $root.'includes/'; $classes = $cls = $root.'classes/'; break; // home laptop

		case 'burrawangcoop.net.au':	// DreamHost
		case 'adra.net.au':		// DreamHost
		case 'canc.org.au':		// DreamHost
		case 'ewills':	$root = '/home/ewills/evan/'; $inc = $root.'includes/'; $classes = $cls = $root.'classes/'; break; // DreamHost

		case 'apps.acu.edu.au':		// ACU
		case 'testapps.acu.edu.au':	// ACU
		case 'dev1.acu.edu.au':		// ACU
		case 'blogs.acu.edu.au':	// ACU
		case 'studentblogs.acu.edu.au':	// ACU
		case 'dev-blogs.acu.edu.au':	// ACU
		case 'evanw':	$root = '/home/evanw/';	$inc = $root.'includes/'; $classes = $cls = $root.'classes/'; break; // ACU

		case 'webapps.acu.edu.au':	   // ACU
		case 'panvpuwebapps01.acu.edu.au': // ACU
		case 'test-webapps.acu.edu.au':	   // ACU
		case 'panvtuwebapps01.acu.edu.au': // ACU
		case 'dev-webapps.acu.edu.au':	   // ACU
		case 'panvduwebapps01.acu.edu.au': // ACU
		case 'evwills':
			if( isset($_SERVER['HOSTNAME']) && $_SERVER['HOSTNAME'] === 'panvtuwebapps01.acu.edu.au' ) {
				$root = '/home/evwills/'; $inc = $root.'includes/'; $classes = $cls = $root.'classes/'; // ACU
			} else {
				$root = '/var/www/html/mini-apps/'; $inc = $root.'includes_ev/'; $classes = $cls = $root.'classes_ev/'; // ACU
			}
			break;
	};

	set_include_path( get_include_path().PATH_SEPARATOR.$inc.PATH_SEPARATOR.$cls.PATH_SEPARATOR.$pwd);
	if(file_exists($inc.'debug.inc.php'))
	{
		if(!file_exists($pwd.'debug.info') && is_writable($pwd) && file_exists($inc.'template.debug.info'))
		{ copy( $inc.'template.debug.info' , $pwd.'debug.info' ); };
		require_once($inc.'debug.inc.php');
	}
	else { function debug(){}; };

	class emergency_log { public function write( $msg , $level = 0 , $die = false ){ echo $msg; if( $die === true ) { exit; } } }
};

// END: debug include
// ==================================================================


require_once('micro_time.class.php');
require_once('regex_tester.class.php');

if( isset($_REQUEST['jquery']) && isset($_REQUEST['callback'] ) )
{
	$open = $_REQUEST['callback'].'(';
	$close = ')';
}
else
{
	$open = $close = '';
}

if( !isset($_POST['json']) || !is_string($_POST['json']) || '' === trim($_POST['json']) )
{
	echo "{'success': false, 'message': 'You must supply a \"json\" POST variable with all the API required values. (See <a href=\"https://github.com/evanwills/regex_tester\">Regex Tester</a> for more info.)'}";
	exit;
}

$json = json_decode($_POST['json']);
//debug($json);

$output = array(
	'matched' => false,
	'message' => regex_tester::set_delim($json->delimOpen, $json->delimClose),
	'regexErrors' => array(),
	'samples' => array(),
	'success' => true
);

$regex_pairs = array();
$has_errors = false;
for( $a = 0 ; $a < count($json->regexPairs) ; $a += 1 )
{
	$tmp = regex_tester::get_obj($json->regexPairs[$a], $json->doReplace);

	$regex_pairs[] = $tmp;
	if( $tmp->has_errors() )
	{
		$output['regexErrors'][] = $tmp->get_errors();
		$has_errors = true;
	}
}

$matched = false;
for( $a = 0 ; $a < count($json->sample) ; $a += 1 )
{
	$tmp = array( 'sampleID' => $a, 'sampleMatches' => array() );

	for( $b = 0 ; $b < count($regex_pairs) ; $b += 1 )
	{
		$tmp_inner = $regex_pairs[$a]->process($json->sample[$a]);
		$tmp['sampleMatches'][] = $tmp_inner['output'];
		$json->sample[$a] = $tmp_inner['sample'];
		if( $matched === false )
		{
			$matched = $regex_pairs[$a]->something_matched();
		}
	}
	if( $json->doReplace === true )
	{
		$tmp['sampleMatches'] = array($json->sample[$a]);
	}
	$output['samples'][] = $tmp;
}


if( $matched === true )
{
	$output['matched'] = 'true';
}
else
{
	$output['samples'] = array();
	$output['matched'] = 'false';
}




echo $open.json_encode($output).$close;
