<?php

require_once('micro_time.class.php');
require_once('regex_tester.class.php');

if( !isset($_POST['json']) || !is_string($_POST['json']) || '' === trim($_POST['json']) )
{
	echo "{'success': false, 'message': 'You must supply a \"json\" POST variable with all the API required values. (See <a href=\"https://github.com/evanwills/regex_tester\">Regex Tester</a> for more info.)'}";
	exit;
}

$json = json_decode($_POST['json']);
$regex_pairs = array();

$output_message = regex_tester::set_delim($json->delimOpen, $json->delimClose);

for( $a = 0 ; $a < count($json->regexPairs) ; $a += 1 )
{
	$regex_pairs[] = new regex_tester(
		 $json->regexPairs[$a]->find
		,$json->regexPairs[$a]->modifiers
		,$json->regexPairs[$a]->replace
		,$json->regexPairs[$a]->id
	);
}