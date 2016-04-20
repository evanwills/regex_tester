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

// ==================================================================


$.RegexDoerJsonAjax = function () {
	"use strict";

	var engine,
		output,
		renderFunc,
		jsonObject,
		fixPlusRegex = new RegExp(/\+/,'g'),
		unfixPlusRegex = new RegExp(/%2b/,'g');

	function onError(data) {
//		console.log('inside onError()');
		console.log('data.responseText = ', data.responseText);
		console.log('JSON.parse(data.responseText) = ', JSON.parse(data.responseText));
		alert('Something went wrong. Check out the console message.');
	}

	function onSuccess(data) {
		renderFunc(data, jsonObject);
	}

	function fixPlus(input, revert) {
		var a = 0,
			find = fixPlusRegex,
			replace = '%2b';

		if (revert === true) {
			find = unfixPlusRegex;
			replace = '+';
		}

		for (a = 0; a < input.regexPairs.length; a += 1) {
			input.regexPairs[a].find = input.regexPairs[a].find.replace(find, replace);
			input.regexPairs[a].replace = input.regexPairs[a].replace.replace(find, replace);
		}
		for (a = 0; a < input.samples.length; a += 1) {
			input.samples[a] = input.samples[a].replace(find, replace);
		}
		return input;
	}

	function getAJAXobject(jsonObj) {
		var AJAXurl = '',
			a = 0;

		jsonObject = jsonObj;

		jsonObj = fixPlus(jsonObj);
		AJAXurl = engine.getURL() + '?json=' + JSON.stringify(jsonObj) + '&jquery=true&callback=?';
		jsonObj = fixPlus(jsonObj, true);

		return {
			'url': AJAXurl,
			'dataType': "json",
			'error': onError,
			'success': onSuccess
		};
	}

	this.findReplace = function (jsonObj, renderer) {
		renderFunc = renderer;

		$('#loadingText').html('Loading. Please wait...');

		$.ajax(getAJAXobject(jsonObj));
	};

	this.testRegex = function (jsonObj, renderer) {
		renderFunc = renderer;

		$('#loadingText').html('Loading. Please wait...');

		$.ajax(getAJAXobject(jsonObj));
	};

	this.validateRegex = function (regex, modifiers, delim) {};

	this.setEngine = function (regexEngineObj) {
		if (regexEngineObj instanceof RegexEngine !== true) {
			throw {'message': 'RegexDoerLocal::setEngine() expects only parameter regexEngineObj to be an instance of RegexEngine'};
		}
		engine = regexEngineObj;
	};

	this.validateDelim = function (input) {
		return engine.validateDelim(input);
	};

	this.validateModifiers = function (modifiers) {

	};
};