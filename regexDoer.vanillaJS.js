
$.RegexDoerVanillaJS = function () {
	"use strict";
	var engine;

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
            output = {'matched': false, result: []};

        if (regexObj.ok === true) {
            tmpMatch = sample.match(regexObj.regexp);
            if (tmpMatch.length !== null) {
                output.matched = true;
                if (regexObj.isGlobal) {
                    tmpLen = tmpMatch.length;
                    for (a = 0; a < tmpLen; a += 1) {
                        output.result.push(tmpMatch[a].match(regexObj.regexpNonGlobal));
                    }
                } else {
                    output.result.push(tmpMatch);
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
				sample = sample.replace(regexObjs[a].parsed.regexp, regexObjs[a].replace, sample);
			} else {
				tmpResult.ok = false;
			}

			output.push(tmpResult);
		}
		return output;
	}

	this.validateRegex = function (regex, modifiers, delim) {
		var output = {'regexp': null, 'isGlobal': false, 'ok': true, 'errorMsg': '', 'regexpNonGlobal': null};

		if (typeof regex !== 'string' || regex === '') {
			output.errorMsg = 'regex must be a non-empty string. "' + typeof regex + '" given';
			output.ok = false;
		}
		try {
			engine.validateModifiers(modifiers);
		} catch (e) {
			output.errorMsg = 'invlid modifiers. ' + e.message;
			output.ok = false;
		}

		console.log(regex);
		try {
			output.regexp = new RegExp(regex, modifiers);
		} catch (e) {
			output.errorMsg = e.message;
			output.ok = false;
		}
		if (modifiers.match(/g/)) {
			output.isGlobal = true;
			output.regexpNonGlobal = new RegExp(regex, modifiers.replace('g', ''));
		}
		return output;

	};

	function testAllRegexes(allRegexes, parent)
	{
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
            regexes = [],
			tmp,
			tmpResult = {'id': 0, 'ok': true, 'matched': false, 'result': []},
			tmpRegex,
			tmpSampleMatch,
			tmpSampleResult = [];

		console.log('inside RegexDoerVanillaJS::testRegex()');

		tmp = testAllRegexes(jsonObj.regexPairs, this);
		jsonObj.regexPairs = tmp.regexPairs;
		output.regexErrors = tmp.regexErrors;

        for (a = 0; a < jsonObj.samples.length; a += 1) {

            tmpResult = {'id': 0, 'ok': true, 'matched': false, 'result': []};

			if (tmpResult.ok === true) {
				tmpResult.result = [];
				for (b = 0; b < jsonObj.regexPairs.length; b += 1) {
                    tmpResult.id = jsonObj.regexPairs[b].id;
                    if (jsonObj.regexPairs[b].parsed.ok === true) {
                        tmpSampleResult = processRegex(jsonObj.regexPairs[b].parsed, jsonObj.samples[a]);
                        tmpResult.result.push(tmpSampleResult.result);
                        tmpResult.matched = tmpSampleResult.matched;
                        jsonObj.samples[a] = jsonObj.samples[a].replace(jsonObj.regexPairs[b].parsed.regexp, jsonObj.regexPairs[b].replace);
                    } else {
                        tmpResult.ok = false;
                        tmpResult.errorMsg = jsonObj.regexPairs[b].parsed.errorMsg;
                    }
				}
			}
			regexes.push(tmpResult);
		}
		return regexes;
	};

	this.findReplace = function (jsonObj, renderer) {

		jsonObj= testAllRegexes(jsonObj.regexPairs, this);
	};

	this.setEngine = function (regexEngineObj) {
		engine = regexEngineObj;
	};
	this.validateDelim = function (input) {
		return engine.validateDelim(input);
	};
};