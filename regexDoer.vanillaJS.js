
$.RegexDoerVanillaJS = function () {
	"use strict";
	var engine;
	this.findReplace = function (jsonObj) {};

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

	this.testRegex = function (jsonObj) {
		var a = 0,
			b = 0,
            regexes = [],
			tmpResult,
			tmpRegex,
			tmpSampleMatch,
			tmpSampleResult = [];

		console.log('inside RegexDoerVanillaJS::testRegex()');

		for (a = 0; a < jsonObj.regexPairs.length; a += 1) {
            tmpRegex = {regexp: null, isGlobal: false, ok: true, errorMsg: '', regexpNonGlobal: null};

			try {
				tmpRegex.regexp = new RegExp(jsonObj.regexPairs[a].find, jsonObj.regexPairs[a].modifiers);
			} catch (e) {
				tmpRegex.errorMsg = e.message;
				tmpRegex.ok = false;
			}
			console.log(jsonObj.regexPairs[0].modifiers.match(/g/));
            if (jsonObj.regexPairs[0].modifiers.match(/g/)) {
                tmpRegex.isGlobal = true;
				console.log("jsonObj.regexPairs[" + a + "].modifiers.replace('g', '') = ", jsonObj.regexPairs[a].modifiers.replace('g', ''));
				tmpRegex.regexpNonGlobal = new RegExp(jsonObj.regexPairs[a].find, jsonObj.regexPairs[a].modifiers.replace('g', ''));
            }
            jsonObj.regexPairs[a].parsed = tmpRegex;
        }

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
	this.validateRegex = function (regex, modifiers, delim) {};
	this.setEngine = function (regexEngineObj) {
		engine = regexEngineObj;
	};
	this.validateDelim = function (input) {
		return engine.validateDelim(input);
	};
};