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
	var	regex,
		regexVarieties = [],
		php;
		URL = window.location.href.replace('index.html','');

	regexVarieties.push(new RegexEngine({
		'name': 'PHP PCRE',
		'modifiers': 'imsxeADSXUJu',
		'placeholder': 'is',
		'URL': URL + 'php/regex_tester.json.api.php',
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
