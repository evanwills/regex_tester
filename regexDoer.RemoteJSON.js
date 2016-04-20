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
		jsonObject;


	function onError(data) {
//		console.log('inside onError()');
//		console.log('JSON.parse(data.responseText) = ', JSON.parse(data.responseText));
		alert('Something went wrong. Check out the console message.');
	}

	function onSuccess(data) {
		renderFunc(data, jsonObject);
	}

	function getAJAXobject(jsonObj) {
		var AJAXurl = '';

		jsonObject = jsonObj;

		AJAXurl = engine.getURL() + '?json=' + JSON.stringify(jsonObj) + '&jquery=true&callback=?';

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