

$.RegexDoerXregexp = function () {
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