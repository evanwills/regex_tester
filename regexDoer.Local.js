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



$.RegexDoerLocal = function (doXregexp) {
	"use strict";
	var engine,
		regexAdapter,
		RegexAdapter,
		mode = 'standard';

	if (doXregexp === true) {
		RegexAdapter = function () {
			this.tryRegExp = function (regex, modifiers) {
				var output;
				try {
					output = XRegExp(regex, modifiers);
				} catch (e) {
					console.warn(e);
					throw {'message': e.message};
				}
				return output;
			};
			this.match = function (regexObj, sample) {
				return XRegExp.exec(sample);
			};
			this.replace = function (regexObj, replacement, sample) {
				return XRegExp.replace(sample, regexObj, replacement);
			};
		};
		mode = 'xRegExp';
	} else {
		RegexAdapter = function () {
			this.tryRegExp = function (regex, modifiers) {
				var output;
				try {
					output = new RegExp(regex, modifiers);
				} catch (e) {
					console.warn(e);
					throw {'message': e.message};
				}
				return output;
			};
			this.match = function (regexObj, sample) {
				return sample.match(regexObj);
			};
			this.replace = function (regexObj, replacement, sample) {
				return sample.replace(regexObj, replacement);
			};
		};
	}

	regexAdapter = new RegexAdapter();

	/**
	 * handles actual applying of regex to sample
	 *
	 * param [object] regexObj contains all regex info about regex
	 *		 being applied
	 * param [string] sample content to apply regex to
	 *
	 * return [object] containing two properties:
	 *		'matched' [bool] whether the regex matched anything
	 *		'result' [array] two dimensional array where the first
	 *						 dimension is each match and the second
	 *						 dimension what was actually matched
	 */
	function processRegex(regexObj, sample) {
		var a = 0,
			tmpLen = 0,
			tmpMatch,
			output = {'matched': false, result: []},
			tmp,
			tmpResult = {'wholeMatch': '', 'subPatterns': []};

		if (regexObj.ok === true) {
			tmpMatch = regexAdapter.match(regexObj.regexp, sample);
			if (tmpMatch !== null && tmpMatch.length !== null) {
				output.matched = true;
				tmpLen = tmpMatch.length;
				if (regexObj.isGlobal) {
					for (a = 0; a < tmpLen; a += 1) {
						tmp = tmpMatch[a].match(regexObj.regexp);
                        output.result.push({'wholeMatch': tmp.shift(), 'subPatterns': tmp});
                    }
                } else {
					tmp = [];
					for (a = 0; a < tmpLen; a += 1) {
						if (tmpMatch[a] !== undefined) {
							tmp.push(tmpMatch[a]);
						}
					}
					output.result.push({'wholeMatch': tmp.shift(), 'subPatterns': tmp});
				}
			}
		}
        return output;
    }


	/**
	 * handles applying each regex in turn to a single sample string
	 *
	 * param [array] regexObjs list of all regex objects to be
	 *		 processed
	 * param [string] sample content to apply regexes to
	 *
	 * return [array] containing a list of result objects, each of which specifies:
	 *		'regexID' [num] ID of the regex that did the matching
	 *		'ok' [bool] whether or not that regex was valid
	 *		'matched' [bool] whether or not the regex matched anything in the string
	 *		'matches' [array] list of matches
	 */
    function processSample(regexObjs, sample) {
		var a = 0,
			output = [],
			tmp,
			tmpResult = {};

		for (a = 0; a < regexObjs.length; a += 1) {
			tmpResult = {
				'regexID': regexObjs[a].id,
				'ok': true,
				'matched': false,
				'matches': []
			};

			if (regexObjs[a].parsed.ok === true) {
				tmp = processRegex(regexObjs[a].parsed, sample);
				tmpResult.matches = tmp.result;
				tmpResult.matched = tmp.matched;
				sample = regexAdapter.replace(regexObjs[a].parsed.regexp, regexObjs[a].replace, sample);
			} else {
				tmpResult.ok = false;
			}

			output.push(tmpResult);
		}
		return output;
	}


	this.validateRegex = function (regex, modifiers, delim) {
		var output = {regexp: null, isGlobal: false, ok: true, errorMsg: ''};

		if (typeof regex !== 'string' || regex === '') {
			console.warn('$.RegexDoerLocal.validateRegex() expects first parameter regex to be a non-empty string. "' + typeof regex + '" given');
			throw {'message': '$.RegexDoerLocal.validateRegex() expects first parameter regex to be a non-empty string. "' + typeof regex + '" given'};
		}
		try {
			engine.validateModifiers(modifiers);
		} catch (e) {
			console.warn('$.RegexDoerLocal.validateRegex() expects second parameter modifiers to be a valid list of RegExp modifiers. ' + e.message);
			throw {'message': '$.RegexDoerLocal.validateRegex() expects second parameter modifiers to be a valid list of RegExp modifiers. ' + e.message};
		}

		console.log(regex);
		try {
			output.regexp = regexAdapter.tryRegExp(regex, modifiers);
		} catch (e) {
			output.errorMsg = e.message;
			output.ok = false;
		}
		if (modifiers.match(/g/)) {
			output.isGlobal = true;
		}
		return output;
	};

	function testAllRegexes(allRegexes, parent) {
		var a = 0,
			output = [];

		for (a = 0; a < allRegexes.length; a += 1) {
            allRegexes[a].parsed = parent.validateRegex(allRegexes[a].find, allRegexes[a].modifiers);
			if (allRegexes[a].parsed.ok === false) {
				output.push({
					'regexID': allRegexes[a].id,
					'message': allRegexes[a].parsed.errorMsg
				});
			}
        }

		return {'regexPairs': allRegexes, 'regexErrors': output};
	}

	this.testRegex = function (jsonObj, renderer) {
		var a = 0,
			b = 0,
            output = {
				'doReplace': jsonObj.doReplace,
				'message': '',
				'regexErrors': [],
				'samples': [],
				'success': true
			},
			tmp,
			tmpResult,
			tmpRegex;


		console.log('inside RegexDoerLocal::testRegex() (in ' + mode + ' mode)');

		tmp = testAllRegexes(jsonObj.regexPairs, this);
		jsonObj.regexPairs = tmp.regexPairs;
		output.regexErrors = tmp.regexErrors;

        for (a = 0; a < jsonObj.samples.length; a += 1) {
			output.samples.push({'sampleID': a, 'sampleMatches': processSample(jsonObj.regexPairs, jsonObj.samples[a])});
		}
		renderer(output, jsonObj);
	};

	this.findReplace = function (jsonObj, renderer) {
		var a = 0,
			b = 0,
            output = {
				'doReplace': jsonObj.doReplace,
				'message': '',
				'regexErrors': [],
				'samples': [],
				'success': true
			},
			tmp;
		console.log('inside RegexDoerLocal::testRegex() (in ' + mode + ' mode)');

		tmp = testAllRegexes(jsonObj.regexPairs, this);
		jsonObj.regexPairs = tmp.regexPairs;
		output.regexErrors = tmp.regexErrors;

        for (a = 0; a < jsonObj.samples.length; a += 1) {
			for (b = 0; b < jsonObj.regexPairs.length; b += 1) {
				if (jsonObj.regexPairs[b].parsed.ok === true) {
					jsonObj.samples[a] = jsonObj.samples[a].replace(jsonObj.regexPairs[b].parsed.regexp, jsonObj.regexPairs[b].replace);
				}
			}
			output.samples.push(jsonObj.samples[a]);
		}
		renderer(output, jsonObj);
	};

	this.setEngine = function (regexEngineObj) {
		if( regexEngineObj instanceof RegexEngine !== true )
		{
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