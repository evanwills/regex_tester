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
		output;



	this.findReplace = function (input) {
		var AJAXurl = '';

		AJAXurl = '?json=' + output.toJson() + '&jquery=true&callback=?';

		$('#loadingText').html('Loading. Please wait...');

		$.ajax({
			'url': AJAXurl,
			'dataType': engine.getURL(),
			'error': on_error,
			'success': on_success
		});
	};

	this.testRegex = function (input) {
		var jsonObj = input.toJson();
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
	}

	this.validateDelim = function (input) {
		return engine.validateDelim(input);
	};
};