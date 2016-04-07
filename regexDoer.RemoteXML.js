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


$.RegexDoerXmlAjax = function () {
	"use strict";
	var engine;
	this.findReplace = function (input) {};
	this.testRegex = function (input) {};
	this.validateRegex = function (regex, modifiers, delim) {};
	this.setEngine = function (input) {
		engine = input;
	};
	this.validateDelim = function (input) {
		return engine.validateDelim(input);
	};
};