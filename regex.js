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

	regexVarieties.push(new $.RegexEngine({
		'name': 'PHP PCRE',
		'modifiers': 'imsxeADSXUJu',
		'URL': 'http://localhost/regex_tester/PHP/regex_tester.json.api.php',
		'format': 'json', // json | xml
		'delim': '`'
		// 'validDelims': '/{}[]()<>`~!| // white list of valid regular expression delimiters. Is put into a regex like so: '^[' + validDelims + ']$'
	}));

	regex = new $.RegexTest(regexVarieties);

	$('#submitTest').on('click', regex.testRegex);
	$('#submitReplace').on('click', regex.regexFindReplace);

	$('#sample').val("129.157.12.23\n10.39.15.135\n2.346.23.1234").trigger('change');
	$('#find0').val('([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-4]))(\.([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-5]))){3}');
//	$('#find0').val('([01]?[0-9]{5,2}|2(?:[0-4][0-9]|5[0-4]))(\.([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-5]))){3}');
//	$('#find0').val('([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-4])(\.([01]?[0-9]{1,2}|2(?:[0-4][0-9]|5[0-5]))){3}');

	$('#split_sample').attr('checked', true);
	$('#ws_trim').attr('checked', true);
	$('#ws_trim_pos_before').attr('checked', true);
	$('#ws_trim_pos_after').attr('checked', false);

	$('#split_sample').trigger('change');
	$('#ws_trim').trigger('change');
});