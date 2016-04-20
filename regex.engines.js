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

/**
 * @function $.RegexEngine() encapsulation for meta info about regex
 *			 engines available to test against
 * @var variety [obj] containing the following properties:
 *			'name': [string],
 *			'delim': [string] single char - by default must
 *					be non-alpha-numeric and non-white-space
 *			'format': [string] (optional) 'json' or 'xml'
 *			'modifiers': [string] list of alpha characters
 *			'url': [string] (optional) URL of where to send post
 *					objects to for server-side processing
 *			'validDelimList': [string] (optional) white-list of valid
 *					regexp delimiters
 */
function RegexEngine(variety) {
	'use strict';
	var defaultDelimClose = '`',
		defaultDelimOpen = '`',
		delimClose = '`',
		delimOK = true,
		delimOpen = '`',
		delimRegex = new RegExp('[^\w0-9\s]$'),
		format = 'json',
		modifierRegex,
		modifiers = '',
		name = '',
		placeholder = 'ig',
		tmp,
		url = false,
		validDelimiters = '';

	if (variety.name !== undefined) {
		name = variety.name.replace(/[^a-z0-9\s_\-]+/ig, '');
	} else {
		throw { message: 'variety.name is undefined', object: 'RegexEngine', line: 34, method: 'constructor' };
	}

	if (variety.modifiers !== undefined && variety.modifiers.match(/^[a-z]+$/i)) {
		modifiers = variety.modifiers;
	} else {
		console.log('variety.modifiers = ', variety.modifiers);
		console.log('variety.modifiers !== undefined = ', variety.modifiers !== undefined);
		console.log('variety.modifiers.match(/^[a-z]+$/i) = ', variety.modifiers.match(/^[a-z]+$/i));
		throw { message: 'Supplied modifiers are invalid. modifiers = "' + variety.modifiers + '"', object: 'RegexEngine', line: 37, method: 'constructor' };
	}

	if (variety.placeholder !== undefined && typeof variety.placeholder === 'string' ) {
		placeholder = variety.placeholder;
	}

	if (variety.format.toLowerCase === 'xml') {
		format = 'xml';
	}

	if (variety.URL !== undefined && typeof variety.URL === 'string' && variety.URL.match(/^https?:\/\/(?:localhost|[a-z0-9_\-]+(?:\.[a-z0-9_\-]+)*\.[a-z]{2,3}(?:\.[a-z]{2})?|(?:[01]?[0-9]{1,2}|2([0-4][0-9]|5[0-4]))(?:\.(?:[01]?[0-9]{1,2}|2([0-4][0-9]|5[0-4]))){3})\/?\//)) {
		url = variety.URL;
	}

	if (typeof variety.validDelimList === 'string') {
		try {
			tmp = new RegExp('^[' + variety.validDelims + ']$');
		} catch (e) {
			throw {'message': 'supplied list of delimiters could not be made into a pattern'};
		}
		delimRegex = new RegExp('^[' + variety.validDelim + ']$');
	}

	modifierRegex = new RegExp('[^' + modifiers + ']');

	/**
	 * @method getName() returns the name of the regex engine
	 */
	this.getName = function () {
		return name;
	};

	/**
	 * @method getURL() returns the URL of the regex engine's
	 *			external server
	 */
	this.getURL = function () {
		return url;
	};

	/**
	 * @method getModifiers() returns a list of all the valid
	 *			modifiers for the regex engine
	 */
	this.getModifiers = function () {
		return modifiers;
	};

	/**
	 * @method getPlaceholder() returns the placeholder string
	 *			for the modifiers for the regex engine
	 */
	this.getPlaceholder = function () {
		return placeholder;
	};

	/**
	 * @method getFormat() returns which type of format should be
	 *			used when parsing (either: 'json' or 'xml')
	 */
	this.getFormat = function () {
		return format;
	};

	/**
	 * @method getDelimOpen() returns the single character used to
	 *			delimit the opening of a regular expression
	 */
	this.getDelimOpen = function () {
		return delimOpen;
	};

	/**
	 * @method getDelimOpen() returns the single character used to
	 *			delimit the closgin of a regular expression
	 */
	this.getDelimClose = function () {
		return delimClose;
	};

	/**
	 * @method validateDelim() checks whether a supplied delimiter is valid
	 * (Throws an exception if delimiter is not valid)
	 * @return [object] containing 'open' & 'close' properties
	 */
	this.validateDelim = function (tmpDelim) {
		var err = '';
		if (typeof tmpDelim === 'string') {
			if (tmpDelim === delimOpen) {
				return {'open': delimOpen, 'close': delimClose};
			}
			if (tmpDelim.length === 1 && tmpDelim.match(delimRegex)) {
				if (tmpDelim === '{' || tmpDelim === '}') {
					delimOpen = '{';
					delimClose = '}';
				} else if (tmpDelim === '[' || tmpDelim === ']') {
					delimOpen = '[';
					delimClose = ']';
				} else if (tmpDelim === '<' || tmpDelim === '>') {
					delimOpen = '<';
					delimClose = '>';
				} else if (tmpDelim === '(' || tmpDelim === ')') {
					delimOpen = '(';
					delimClose = ')';
				} else {
					delimOpen = delimClose = tmpDelim;
				}
				return {'open': delimOpen, 'close': delimClose};
			} else {
				if (validDelimiters !== '') {
					err = 'be one of the following: "' + validDelimiters.split('", "') + '" characters';
				} else {
					err = 'a single non-alphanumeric, non-white space character';
				}
				throw {'message': 'Regex delimiter ("' + tmpDelim + '") is not valid. It must be ' + err};
			}
		} else {
			throw {'message': 'Regex delimiter is not valid. ' + typeof tmpDelim + 'given'};
		}
	};

	/**
	 * @method validateModifiers() checks a given string to see if
	 *			all characters are valid modifiers for this regex
	 *			engine
	 * (Throws an exception if modifiers are not valid)
	 *
	 * @return true (if modifiers are valid)
	 */
	this.validateModifiers = function (input) {
		var repeatModRegex = new RegExp('([' + modifiers + ']).*?$1');
		if (typeof input !== 'string') {
			throw {'message': 'Regex modifiers must be a string. ' + typeof input + ' given.'};
		} else if (input.match(modifierRegex)) {
			throw {'message': 'Regex modifiers can include up to one of each of the following characters: "' + modifiers.split('", "') + '"'};
		} else if (input.match(repeatModRegex)) {
			throw {'message': 'Each regex modifiers should only occure once.'};
		}
		return true;
	};


	/**
	 * @method modifiersAreValid() checks if supplied modifiers are
	 *			valid
	 *			(NOTE: does NOT throw exception)
	 * @return [boolean] TRUE if modifiers are valid. FALSE otherwise
	 */
	this.modifiersAreValid = function (input) {
		try {
			this.validateModifiers(input);
		} catch (e) {
			return false;
		}
		return true;
	};

	/**
	 * @method delimIsValid() checks if supplied delimiter is valid
	 *			(NOTE: does NOT throw exception)
	 * @return [boolean] TRUE if modifiers are valid. FALSE otherwise
	 */
	this.delimIsValid = function (input) {
		try {
			this.validateDelim(input);
		} catch (e) {
			return false;
		}
		return true;
	};

	try {
		this.validateDelim(variety.delim, variety);
	} catch (e) {
		throw e;
	}
	defaultDelimOpen = delimOpen;
	defaultDelimClose = delimClose;
}

