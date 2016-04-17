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
		console.log('inside onError()');
		console.log('onError(data) = ', data);
		console.log('jsonObject = ', jsonObject);
		console.log('renderFunc = ', renderFunc);
		alert('Something went wrong. Check out the console message.');
	}

	function onSuccess(data) {
		console.log('inside onSuccess()');
		console.log('onSuccess(data) = ', data);
		console.log('jsonObject = ', jsonObject);
		console.log('renderFunc = ', renderFunc);
	}


	this.findReplace = function (jsonObj, renderer) {
		var AJAXurl = '';

		jsonObject = jsonObj;
		renderFunc = renderer;

		AJAXurl = '?json=' + JSON.stringify(jsonObj) + '&jquery=true&callback=?';
		console.log(AJAXurl);

		$('#loadingText').html('Loading. Please wait...');

		$.ajax({
			'url': AJAXurl,
			'dataType': engine.getURL(),
			'error': onError,
			'success': onSuccess
		});
	};

	this.testRegex = function (jsonObj, renderer) {
		var AJAXurl = '';

		jsonObject = jsonObj;
		renderFunc = renderer;

		AJAXurl = '?json=' + JSON.stringify(jsonObj) + '&jquery=true&callback=?';
		console.log(AJAXurl);

		$('#loadingText').html('Loading. Please wait...');

		$.ajax({
			'url': AJAXurl,
			'dataType': engine.getURL(),
			'error': onError,
			'success': onSuccess
		});
	};

	this.validateRegex = function (regex, modifiers, delim) {};

	this.setEngine = function (input, delim) {
		engine = input;
		try {
			engine.validateDelim(delim);
		} catch (e) {
			console.log(e);
		}
	};

	this.setOutput = function (jsonObj) {
		output = jsonObj;
	};

	this.validateDelim = function (input) {
		return engine.validateDelim(input);
	};
};