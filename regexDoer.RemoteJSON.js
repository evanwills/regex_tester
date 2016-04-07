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
	var engine;
	this.findReplace = function (input) {
		var jsonObj = input.toJson();
	};
	this.testRegex = function (input) {};
	this.validateRegex = function (regex, modifiers, delim) {};
	this.setEngine = function (input, delim) {
		engine = input;
		try {
			engine.validateDelim(delim);
		} catch (e) {
			console.log(e);
		}
	};
	this.validateDelim = function (input) {
		return engine.validateDelim(input);
	};
};