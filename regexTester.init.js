if (typeof window.console !== 'object') {
	var Console = function () {
		"use strict";
		this.log = function () { };
		this.warn = function () { };
		this.error = function () { };
		this.info = function () { };
//		this.debug = function () { };
	};
	var console = new Console();
}

$(document).ready(function () {
	'use strict';
	var regex,
		regexVarieties = [],
		php;

	regexVarieties.push(new RegexEngine({
		'name': 'PHP PCRE',
		'modifiers': 'imsxeADSXUJu',
		'placeholder': 'is',
		'URL': 'http://localhost/regex_tester/PHP/regex_tester.json.api.php',
		'format': 'json', // json | xml
		'delim': '`'
		// 'validDelims': '/{}[]()<>`~!| // white list of valid regular expression delimiters. Is put into a regex like so: '^[' + validDelims + ']$'
	}));

	regex = new $.RegexTest(regexVarieties);

	$('#submitTest').on('click', regex.testRegex);
	$('#submitReplace').on('click', regex.regexFindReplace);

	$('#split_sample').trigger('change');
	$('#ws_trim').trigger('change');
});