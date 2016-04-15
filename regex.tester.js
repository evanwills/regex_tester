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
 * @function regexTest() allows you to test Regular Expressions against an input
 */
$.RegexTest = function (varieties) {
	'use strict';

	var doRenderWS = function (input) { return input; },
		engines = [],
		maxLenMatch = '#matched_len',
		maxLenSamp = '#sample_len',
		parsedSample = [],
		regexDelim = '#regex_delim',
		regexDoer,
		sampleDelim = '#split_delim',
		sampleField = '#sample',
		splitSample = '#split_sample',
		state = {
			splitSampleDo: false,
			splitSampleChar: '\n',
			maxLenMatch: 300,
			maxLenSamp: 300,
			trimSample: false,
			trimSampleOutput: false,
			displayWhiteSpaceChars: false,
			regexDelim: '/'
		},
		workingEngine,
		wsAction = 'input[name="ws_action"]',
		renderWs = 'input[name="render_ws"]',
		wsTrim = '#ws_trim',
		z = 0;

	/**
	 * @function setIDitem() replaces keywords in input with id value
	 *
	 * @var [str] input string to be updated
	 * @var [int] id value to replace keyword
	 *
	 * @return [str] updated value of input
	 */
	function setIDitem(input, id) {
		input = input.replace(/\{\{ID\}\}/g, id);
		return input.replace(/\{\{ITEM\}\}/g, (id + 1));
	}


	function HTMLencode(input) {
		var el = document.createElement("div");
		el.innerText = el.textContent = input;
		return el.innerHTML;
	}


	function setRenderWSfunc(e) {
		if ($(e.target).val() === 1) {
			doRenderWS = function (input) {
				var a = 0,
					find = [],
					replace = [];

				if (typeof input !== 'string') {
					console.warn('renderWS() expects first input to be a string. ' + typeof input + 'given.');
					throw { message: 'renderWS() expects first input to be a string. ' + typeof input + 'given.'};
				}

				find.push(new RegExp(' ', 'g'));
				replace.push('[[[space]]]');
				find.push(new RegExp("\n", 'g'));
				replace.push('[[[new line]]]\n');
				find.push(new RegExp("\r", 'g'));
				replace.push('[[[return]]]\r');
				find.push(new RegExp("\l", 'g'));
				replace.push('[[[line feed]]]\l');
				find.push(new RegExp("\t", 'g'));
				replace.push('[[[tab]]]\t');

				for (a = 0; a < find.length; a += 1) {
					input = HTMLencode(input.replace(find[a], replace[a]));
				}
				return input.replace(/\[\[(\[(?:space|new line|return|line feed|tab)\])\]\]/g, '<span class="spc">$1</span>');
			};
		} else {
			doRenderWS = function (input) { return input; };
		}
	}


	/**
	 * @function newPair() returns the raw HTML for a new Regex pair block
	 *
	 * @var [int] id The ID of the new regex pair block
	 * @var [bool] textArea whether or not the new regex pair block should use text input or textarea fields
	 *
	 * @return [str] raw HTML for new regex pair block
	 */
	function newPair(id, textArea) {
		var checked = '',
			fieldType = 'input',
			output = $('#instance').html();

		if (textArea === true) {
			fieldType = 'textarea';
			checked = ' checked="checked"';
		}

		output = output.replace(/\{\{FIND\}\}/i, $('#find-' + fieldType).html().trim());
		output = output.replace(/\{\{REPLACE\}\}/i, $('#replace-' + fieldType).html().trim());
		output = output.replace(/\{\{CHECKED\}\}/i, checked);

		output = setIDitem(output, id);

		return output;
	}


	/**
	 * @function changeFieldType() converts text <INPUT> fields to
	 *			 <TEXTAREA> fields (and vice versa) for a given regex
	 *			 pair block
	 *
	 * @var [int] id ID or regex pair block to be updated
	 * @var [bool] textarea whether to convert from input to textarea
	 *			 or vice versa
	 */
	function changeFieldType(id, textarea) {
		var checkboxVal = false,
			fieldType = 'input',
		    findTag,
			findTagOuterHTML,
			findValue,
			replaceTag,
			replaceTagOuterHTML,
			replaceValue;

		if (textarea === true) {
			fieldType = 'textarea';
			checkboxVal = true;
		}

		$('#makeTextarea' + id).is(':checked', checkboxVal);

		findValue = $('#find' + id).val();
		replaceValue = $('#replace' + id).val();

		findTag = setIDitem($('#find-' + fieldType).html(), id);
		replaceTag = setIDitem($('#replace-' + fieldType).html(), id);

		$('#find' + id)[0].outerHTML = findTag;
		$('#replace' + id)[0].outerHTML = replaceTag;

		$('#find' + id).val(findValue);
		$('#replace' + id).val(replaceValue);
	}


	/**
	 * @function updatePairs() goes through each regex pair and
	 *			 updates all the IDs and item numbers to ensure
	 *			 they're sequential from zero
	 */
	function updatePairs() {
		var newID = 0;

		$('#regexes-pairs .regexPair').each(function () {
			var a = 0,
				b = 0,
				idToUpdate = ['find', 'replace', 'modifiers', 'makeTextarea', 'addBefore', 'remove', 'addAfter'],
				oldID = $(this).attr('id').replace(/[a-z_]+/, '', 'ig'),
				oldItem,
				newItem,
				tmpElement;

			oldID = (oldID * 1);
			oldItem = oldID + 1;
			newItem = newID + 1;

			function updateOldNew(str, oldVal, newVal) {
				if (str !== undefined && str !== '') {
					str = str.replace(new RegExp(oldVal, 'g'), newVal);
				}
				return str;
			}

			$(this).attr('id', updateOldNew($(this).attr('id'), oldID, newID));

			$(this).find('label').each(function () {
				$(this).attr('for', updateOldNew($(this).attr('for'), oldID, newID));
				$(this).html(updateOldNew($(this).html(), oldItem, newItem));
			});

			$(this).find('input').each(function () {
				if ($(this).attr('type') === 'checkbox') {
					$(this).off('change');
					$(this).data('regex', newID);
					$(this).attr('id', updateOldNew($(this).attr('id'), oldID, newID));
					$(this).on('change', function (e) {
						var tmpID = $(this).data('regex'),
							tmpTextarea = $(this).is(':checked');

						changeFieldType(tmpID, tmpTextarea);
					});
				} else {
					$(this).attr('id', updateOldNew($(this).attr('id'), oldID, newID));
				}
				$(this).attr('name', updateOldNew($(this).attr('name'), oldID, newID));
				$(this).attr('title', updateOldNew($(this).attr('title'), oldItem, newItem));
				$(this).attr('placeholder', updateOldNew($(this).attr('placeholder'), oldItem, newItem));
			});

			$(this).find('textarea').each(function () {
				$(this).attr('id', updateOldNew($(this).attr('id'), oldID, newID));
				$(this).attr('name', updateOldNew($(this).attr('name'), oldID, newID));
				$(this).attr('title', updateOldNew($(this).attr('title'), oldItem, newItem));
				$(this).attr('placeholder', updateOldNew($(this).attr('placeholder'), oldItem, newItem));
			});

			$(this).find('button').each(function () {
				$(this).attr('id', updateOldNew($(this).attr('id'), oldID, newID));
				$(this).data('regex', newID);
			});
			newID += 1;
		});
	}

	function disableAddRemove(doBool) {
		$('.add-pairs').attr('disabled', doBool);
		$('.remove-pairs').attr('disabled', doBool);
	}

	/**
	 * @function removePair() removes a regexPair block (and
	 *			 renumbers all subsequent regexPair blocks)
	 *
	 * @var [int] id ID of regexPair block to be removed
	 */
	function removePair(id) {
		var a = 0,
			tmpNewID = 0;
		disableAddRemove(true);
		$('#addBefore' + id).off('click');
		$('#addAfter' + id).off('click');
		$('#remove' + id).off('click');

		$('#regexp' + id).remove();
		console.log('inside removePair');
		console.log('id:', id);
		console.log('$(#regexes-pairs li).length', $('#regexes-pairs li').length);
		console.log((id + 1) <= $('#regexes-pairs li').length);
		updatePairs();

		disableAddRemove(false);
	}



	/**
	 * @function addNewPair() adds a new pair either before or after
	 *			 the appropriate regexPair block
	 *
	 * @var [int] id ID of regexPair block to be removed
	 * @var [str] pos Position to add ('before' or 'after')
	 */
	// TODO break this function up into
	function addNewPair(id, pos) {
		var a = 0,
			nextID,
			tmpPair,
			textarea = false;

		disableAddRemove(true);

		textarea = $('#makeTextarea' + id).is(':checked');

		if (pos !== 'before') {
			pos = 'after';
		}

		if ($('#regexes-pairs li').length  === 0) {
			$('#regexes-pairs').html(newPair(0, false));
			id = '0';
		} else {
			if ($('#regexes-pairs li').length === (id + 1) && pos === 'after') {
				id += 1;
				$('#regexes-pairs').append(newPair(id, textarea));
			} else {
				if (pos === 'after') {

					$('#regexp' + id).after(newPair(id, textarea));
				} else {
					$('#regexp' + id).before(newPair(id, textarea));
				}
				updatePairs();
			}
		}

		$('#find' + id).attr('value', '');
		$('#replace' + id).attr('value', '');

		if (textarea === true) {
			$('#makeTextarea' + id).is(':checked', true);
		}


		function activateAddButton(e) {
			var tmpID,
				tmpPos,
				tmpTextArea = false;

			e.preventDefault();

			tmpID = $(this).data('regex');
			tmpPos = $(this).data('pos');

			console.log('about to add');

			if ($('#makeTextarea' + tmpID).is('checked')) {
				tmpTextArea = true;
			}

			addNewPair(tmpID, tmpPos, tmpTextArea);

			return false;
		}


		$('#addBefore' + id).on('click', activateAddButton);
		$('#addAfter' + id).on('click', activateAddButton);

		$('#remove' + id).on('click', function (e) {
			var tmpID = $(this).data('regex');

			console.log('about to remove');

			e.preventDefault();

			if ($('#regexes-pairs li').length > 1) {
				removePair(tmpID);
			} else {
				alert('This is the only Regex pair! Why do you want to delete it?');
			}

			return false;
		});

		$('#makeTextarea' + id).on('change', function (e) {
			var tmpID = $(this).data('regex'),
				tmpTextarea = $(this).is(':checked');

			changeFieldType(tmpID, tmpTextarea);
		});
		if (textarea === true) {
			console.log('#makeTextarea' + id);
			$('#makeTextarea' + id).is(':checked', 'checked');
			console.log($('#makeTextarea' + id).is(':checked'));
		}

		$('#regexp' + id).data('regex', id);

		disableAddRemove(false);
	}


	function addEngineVariety(engine) {
		var newEngine,
			engineName = '',
			engineID = '';
		if (typeof engine.getName === 'function' && typeof engine.getURL === 'function' && typeof engine.getModifiers === 'function' && typeof engine.getFormat === 'function' && typeof engine.getDelimOpen === 'function' && typeof engine.getDelimClose === 'function') {
			engines.push(engine);

			engineName = engine.getName();
			engineID = engineName.replace(/[^a-z0-9_\-]+/ig, '');

			newEngine = $('#regex-engine-item').html().trim();
			newEngine = newEngine.replace(/\{\{RegexEngineID\}\}/g, engineID);
			newEngine = newEngine.replace(/\{\{RegexEngineName\}\}/g, engineName);
			$('#regex-engines').append(newEngine);
		}
		console.log(engines);
	}


	function sampleHasChanged(input) {
		if (typeof input === 'boolean') {
			$(sampleField).data('haschanged', input);
		} else {
			console.warn('sampleHasChanged() input must be boolean');
			throw 'sampleHasChanged() input must be boolean';
		}
	}


	function parseSample() {
		var a = 0;

		console.log('inside parseSample()');
		console.log('$(' + sampleField + ').data(haschanged): ', $(sampleField).data('haschanged'));
		if ($(sampleField).data('haschanged')) {
			// purge sample
			parsedSample = [];
			// make sample an array containing a single string
			parsedSample.push($(sampleField).val());

			if ($(splitSample).is(':checked') && $(sampleDelim).val() !== '') {
				// break up sample
				state.splitSampleDo = true;
				state.splitSampleChar = $(sampleDelim).val();
				parsedSample = parsedSample[0].split(new RegExp(state.splitSampleChar, 'g'));
			}

			state.trimSampleOutput = false;
			if ($(wsTrim).is(':checked')) {
				if ($('#ws_trim_pos_before').is(':checked')) {
					for (a = 0; a < parsedSample.length; a += 1) {
						parsedSample[a] = parsedSample[a].trim();
					}
				} else {
					state.trimSampleOutput = true;
				}
			}
			sampleHasChanged(false);
		}
	}


	function getRegexPair(id) {
		var output = { id: 0, ok: false, 'find': '', 'replace': '', 'modifiers': '' };

		if (typeof id !== 'number') {
			console.warn('getRegexPair() expects param id to be a number! ' + typeof id + ' given.');
			throw 'getRegexPair() expects param id to be a number! ' + typeof id + ' given.';
		}
		output.id = id;
		output.find = $('#find' + id).val();
		output.replace = $('#replace' + id).val();

		if (workingEngine.validateModifiers($('#modifiers' + id).val())) {
			output.modifiers = $('#modifiers' + id).val();
			output.ok = true;
		} else {
			output.ok = false;
			// do something about problem;
		}
		return output;
	}


	function buildJSONobject(doReplace) {
		var a = 0,
			jsonObj = {
				'delimClose': '',
				'delimOpen': '',
                'doReplace': false,
				'ok': true,
				'matchResultLen': 300,
				'regexPairs': [],
				'samples': [],
				'sampResultLen': 300,
				'trimOutput': false,
				'url': false
			},
			sample = [];

		try {
			workingEngine.validateDelim($(regexDelim).val());
		} catch (e) {
			console.error(e.message);
		}

		parseSample();

        if (doReplace === true) {
            jsonObj.doReplace = true;
        }

		jsonObj.delimOpen = workingEngine.getDelimOpen();
		jsonObj.delimClose = workingEngine.getDelimClose();
		jsonObj.url = workingEngine.getURL();
		jsonObj.trimOutput = state.trimSampleOutput;
		jsonObj.samples = parsedSample;

		if ($('.regexPair').length > 0) {
			jsonObj.regexPairs = [];
			$('#regexes-pairs .regexPair').each(function () {
				var newPair = {},
					newPairID = 0;

				if ($(this).data('regex') !== undefined && typeof ($(this).data('regex') * 1) === 'number') {
					newPairID = ($(this).data('regex') * 1);
				} else {
					console.warn('buildJSONobject() expects each regexPair block to have a data attribute named "regex" with a numeric value');
					throw 'buildJSONobject() expects each regexPair block to have a data attribute named "regex" with a numeric value';
				}

				newPair = getRegexPair(newPairID);

				jsonObj.regexPairs.push(newPair);
			});
		}

		jsonObj.sampResultLen = ($(maxLenSamp).val() * 1);
		jsonObj.matchResultLen = ($(maxLenMatch).val() * 1);
		state.maxLenMatch = jsonObj.matchResultLen;
		state.maxLenSamp = jsonObj.sampResultLen;

		state.trimSampleOutput = jsonObj.trimOutput;

		console.log(jsonObj);
		return jsonObj;
	}


	function renderProblemRegex(regexErrors) {
		var a = 0,
			innerHTML = '',
			tmpSelector = '';
		if (regexErrors.length > 0) {
			for (a = 0; a < regexErrors.length; a += 1) {
				tmpSelector = '#regexp' + regexErrors[a].regexID;
				if (regexErrors[a] === undefined || typeof regexErrors[a].message !== 'string' || typeof regexErrors[a].regexID !== 'number') {
					throw {'message': 'renderProblemRegex() expects only parameter regexErrors to be an array of objects that have a string propert "message" and a number property "regexID"'};
				}
				if ($(tmpSelector).hasClass('regex-error') === true) {
					$(tmpSelector + ' .error-msg').html(regexErrors[a].message);
				} else {
					$(tmpSelector).addClass('regex-error');
					$(tmpSelector).prepend('<span class="error-msg">' + regexErrors[a].message + '</span>');
				}
			}
			return true;
		}
		return false;
	}

	function mergeRegexSamples(samples, regexes, regexErrors) {
		var a = 0,
			b = 0,
			regexID = 0,
			regexErrIndex = false,
			tmpSelector = '';

		for (a = 0; a < regexErrors.length; a += 1) {
			regexID = regexErrors[a].regexID;

			if (regexes[regexID] === undefined || regexes[regexID].id !== regexID) {
				for (b = 0; b < regexes.length; b += 1) {
					if (regexes[b].id === regexID) {
						regexID = regexes[b].id
					}
				}
			}

			if (regexErrors[a].patternParts !== undefined) {
				regexErrors[a].formatted = '';
				if (regexErrors[a].patternParts.good !== undefined && regexErrors[a].patternParts.good !== '') {
					regexErrors[a].formatted += '<span class="regex-part-good">' + HTMLencode(regexErrors[a].patternParts.good) + '</span>';
				}
				if (regexErrors[a].patternParts.problem !== undefined && regexErrors[a].patternParts.problem !== '') {
					regexErrors[a].formatted += '<span class="regex-part-problem">' + HTMLencode(regexErrors[a].patternParts.problem) + '</span>';
				}
				if (regexErrors[a].patternParts.bad !== undefined && regexErrors[a].patternParts.bad !== '') {
					regexErrors[a].formatted += '<span class="regex-part-bad">' + HTMLencode(regexErrors[a].patternParts.bad) + '</span>';
				}
			}

			regexes[regexID].ok = false;
			regexes[regexID].error = regexErrors[a];

			tmpSelector = '#regexp' + regexID;
			if ($(tmpSelector).hasClass('regex-error') === true) {
				$(tmpSelector + ' .error-msg').html(regexErrors[a].message);
			} else {
				$(tmpSelector).addClass('regex-error');
				$(tmpSelector).prepend('<span class="error-msg">' + regexErrors[a].message + '</span>');
			}
		}

		for (a = 0; a < samples.length; a += 1) {
			if (samples[a].sampleMatches === undefined) {
				break;
			}
			for (b = 0; b < samples[a].sampleMatches.length; b += 1) {
				regexID = samples[a].sampleMatches[b].regexID;
				samples[a].sampleMatches[b].regex = regexes[regexID];
			}
		}
		return samples;
	}


	function renderMatchBlock(matches) {
		var a = 0,
			output = $('#match-sample-item').html().replace('{{MATCH_0}}', doRenderWS(matches.wholeMatch.substr(0, state.maxLenMatch))),
			subpatterns = '';

		if (matches.subPatterns.length > 0) {
			subpatterns = '\n\t\t\t\t\t\t\t\t\t\t<ol class="match-subpatterns">';
			for (a = 0; a < matches.subPatterns.length; a += 1) {
				subpatterns += '\n\t\t\t\t\t\t\t\t\t\t\t<li>' + doRenderWS(matches.subPatterns[a].substr(0, state.maxLenMatch)) + '</li>';
			}
			subpatterns += '\n\t\t\t\t\t\t\t\t\t\t</ol>\n';
		}

		return output.replace('{{SUBPATTERNS}}', subpatterns);
	}


	function renderRegexBlock(regex) {
		var a = 0,
			find = HTMLencode(regex.regex.find),
			output = $('#match-regex').html(),
			matches = '',
			tmp = '';

		if (regex.ok === false) {
			output = output.replace(/(^.*?class="[^"]+)/, '$1 error');
			matches ='<p class="error-message">' + HTMLencode(regex.regex.error.message) + '</p>';
			if (regex.regex.error.formatted !== undefined) {
				find = regex.regex.error.formatted;
			}
		} else if (regex.matched === false) {
			matches = '<p class="no-match">Nothing was matched</p>';
		} else {
			matches = '\n\t\t\t\t\t\t\t\t<ol class="match-match">\n';
			for (a = 0; a < regex.matches.length; a += 1) {
				matches += renderMatchBlock(regex.matches[a]);
			}
			matches += '\n\t\t\t\t\t\t\t\t</ol>\n';
		}
		output = output.replace('{{REGEX_FIND}}', '<pre class="find"><code>' + HTMLencode(regex.regex.find) + '</code></pre>');
		if (regex.regex.modifiers !== '') {
			tmp = '<pre class="modifiers"><code>' + HTMLencode(regex.regex.modifiers) + '</code></pre>';
		} else {
			tmp = '';
		}
		output = output.replace('{{REGEX_MODIFIERS}}', tmp);
		if (regex.regex.replace !== '') {
			tmp = '<pre class="replace"><code>' + HTMLencode(regex.regex.replace) + '</code></pre>';
		} else {
			tmp = '';
		}
		output = output.replace('{{REGEX_REPLACE}}', tmp);

		output = output.replace('{{MATCH_MATCH}}', matches);

		//for (a = 0; a < )

		return output;
	}


	function renderSampleBlock(sampleStr, sampleMatches) {
		var a = 0,
			output = '',
			regexes = '',
			sep = '';

		for (a = 0; a < sampleMatches.length; a += 1) {
			regexes += renderRegexBlock(sampleMatches[a]);
		}
		output = $('#match-sample').html().replace('{{SAMPLE}}', sampleStr.substr(0, state.maxLenSamp));
		output = output.replace('{{MATCH_REGEX}}', regexes);
		return output;
	}


	function renderReturn(input, jsonObj, splitSample) {
		var a = 0,
			b = 0,
			char = '',
			msg = '',
			output,
			sep = '';

		if (typeof input !== 'object' && typeof input.doReplace === 'boolean' && typeof input.message === 'string' && input.regexErrors !== undefined && input.samples !== undefined && typeof input.success === 'boolean') {
			msg = 'renderReturn() expects first parameter [input] to be an object containing with the following properties: doReplace, message, regexErrors, samples & success';
			console.warn(msg);
			throw {'message': msg};
		}

		input.samples = mergeRegexSamples(input.samples, jsonObj.regexPairs, input.regexErrors);

		if (input.doReplace === false) {
			$('#matches .wrapper').html('');
			for (a = 0; a < input.samples.length; a += 1) {
				$('#matches .wrapper').append(renderSampleBlock(jsonObj.sample[input.samples[a].sampleID], input.samples[a].sampleMatches));
			}

			if ($('#matches-tab-btn').hasClass('hide')) {
				$('#matches-tab-btn').removeClass('hide');
				$('#matches').removeClass('hide');
			}
			$('#matches-tab-btn a').tab('show');
		} else {
			switch (state.splitSampleChar) {
				case '\\n':
					char = "\n";
					break;
				case '\\r':
					char = "\r";
					break;
				case '\\r\\n':
					char = "\r\n";
					break;
				case '\\t':
					char = "\t";
					break;
				default:
					char = state.splitSampleChar;
			}
			for (a = 0; a < input.samples.length; a += 1) {
				input.samples[a] = doRenderWS(input.samples[a]);
			}
			output = input.samples.join(char);
			if ($('#output-tab-btn').hasClass('hide')) {
				$('#output-tab-btn').removeClass('hide');
				$('#output').removeClass('hide');
			}
			$('#outputContent').html(output);
			if (input.regexErrors.length > 0) {
				$('#regex-tab-btn a').tab('show');
			} else {
				$('#output-tab-btn a').tab('show');
			}
		}

	}


	function doRegex(replace, event, doReplace) {
		var jsonObject = buildJSONobject(doReplace),
			returnObj;

		event.preventDefault();

		if (jsonObject.ok !== true) {
			renderProblemRegex();
		} else {
			if (replace === true) {
				console.log('regex find & replace');
				returnObj = regexDoer.findReplace(jsonObject);
				renderReturn(returnObj, jsonObject);
			} else {
				console.log('test regex');
				returnObj = regexDoer.testRegex(jsonObject);
				renderReturn(returnObj, jsonObject);
			}
		}
	}


	this.validateRegex = function (id) {
		var jsonObject = buildJSONobject();
	};


	this.testRegex = function (e) {
		doRegex(false, e, false);
	};


	this.regexFindReplace = function (e) {
		doRegex(true, e, true);
	};


	this.setCustomFieldID = function (fieldName, fieldID) {
		if (typeof fieldID !== 'string') {
			console.warn('RegexTest::setCustomFieldID() expects fieldID to be a string. ' + typeof fieldName + ' given.');
			throw 'RegexTest::setCustomFieldID() expects fieldID to be a string. ' + typeof fieldName + ' given.';
		} else if ($(fieldID).length === 0) {
			console.warn('RegexTest::setCustomFieldID() expects fieldID to be an existing form field ID. "' + fieldID + '" does not exist.');
			throw 'RegexTest::setCustomFieldID() expects fieldID to be an existing form field ID. "' + fieldID + '" does not exist.';
		}
		if (typeof fieldName !== 'string') {
			console.warn('RegexTest::setCustomFieldID() expects fieldName to be a string. ' + typeof fieldName + ' given.');
			throw 'RegexTest::setCustomFieldID() expects fieldName to be a string. ' + typeof fieldName + ' given.';
		}
		switch (fieldName) {
		case 'regexDelim':
			regexDelim = fieldID;
			break;
		case 'maxLenSamp':
			maxLenSamp = fieldID;
			break;
		case 'maxLenMatch':
			maxLenMatch = fieldID;
			break;
		case 'wsTrim':
			wsTrim = fieldID;
			break;
		case 'wsAction':
			wsAction = fieldID;
			break;
		case 'wsTrimAfter':
		case 'wsTrimBefore':
			if ($(fieldID).attr('name') !== undefined && $(fieldID).attr('name') !== '') {
				wsAction = 'input[name="' + $(fieldID).attr('name') + '"]';
			} else {
				console.warn('RegexTest::setCustomFieldID() expects fieldName "' + fieldID + '" to be an input (or select) field with a name attribute');
				throw 'RegexTest::setCustomFieldID() expects fieldName "' + fieldID + '" to be an input (or select) field with a name attribute';
			}
			break;
		case 'splitSample':
			splitSample = fieldID;
			break;
		case 'sampleField':
			sampleField = fieldID;
			break;
		case 'sampleDelim':
			sampleDelim = fieldID;
			break;
		default:
			console.warn('RegexTest::setCustomFieldID() expects fieldName to be one of the following "regexDelim", "sampleField", "maxLenSamp", "maxLenMatch", "wsTrim", "wsAction", "splitSample" or "sampleDelim". "' + fieldName + '" given');
			throw 'RegexTest::setCustomFieldID() expects fieldName to be one of the following "regexDelim", "sampleField", "maxLenSamp", "maxLenMatch", "wsTrim", "wsAction", "splitSample" or "sampleDelim". "' + fieldName + '" given';
		}
	};

	// ==========================================
	// START: doing object initialisation stuff.

	engines.push(
		new $.RegexEngine({
			'name': 'Vanilla JS',
			'modifiers': 'gimuy',
			'URL': false,
			'format': 'json', // json | xml
			'delim': '/'
		}),
		new $.RegexEngine({
			'name': 'xRegExp JS',
			'modifiers': 'gimuynsxA',
			'URL': false,
			'format': 'json', // json | xml
			'delim': '/'
		})
	);

	if (varieties.length > 0) {
		for (z = 0; z < varieties.length; z += 1) {
			addEngineVariety(varieties[z]);
		}
	}

	addNewPair(0, 'before', false);

	$('.engine-radio').on('change', function (e) {
		var a = 0,
			regExpEngine;

		function setPattern() {
			$(this).attr('pattern', workingEngine.getModifiers());
		}

		for (a = 0; a < engines.length; a += 1) {
			if (engines[a].getName() === $(this).val()) {
				console.log(this);
				workingEngine = engines[a];

				$('.modifiers').each(setPattern);

				if (workingEngine.delimIsValid(regexDelim) !== true) {
					$(regexDelim).val(workingEngine.getDelimOpen());
				}
				break;
			}
		}
		if (workingEngine.getURL() === false) {

			if (workingEngine.getName() === 'Vanilla JS') {
				console.log('using $.RegexDoerLocal (Vanilla JS mode)');
				console.log($.RegexDoerLocal);
				regexDoer = new $.RegexDoerLocal(false);
			} else {
				console.log('using $.RegexDoerLocal (XRegex mode)');
				regexDoer = new $.RegexDoerLocal(true);
			}
		} else {
			if (workingEngine.getFormat() === 'xml') {
				console.log('using $.RegexDoerXmlAjax');
				regexDoer = new $.RegexDoerXmlAjax();
			} else {
				console.log('using $.RegexDoerJsonAjax');
				regexDoer = new $.RegexDoerJsonAjax();
			}
		}
		regexDoer.setEngine(workingEngine, $(regexDelim).val());
	});

	$('#regexVanillaJS').trigger('change');

	$(sampleField).on('change', function () { sampleHasChanged(true); });
	$(wsTrim).on('change', function () {
		sampleHasChanged(true);
		if ($(this).is(':checked')) {
			$(wsAction).each(function () {
				$(this).attr('disabled', false);
			});
		} else {
			$(wsAction).each(function () {
				$(this).attr('disabled', true);
			});
		}
	});

	$(wsAction).on('change', function () { sampleHasChanged(true); });
	$(splitSample).on('change', function () {
		sampleHasChanged(true);
		if ($(this).is(':checked')) {
			$(sampleDelim).attr('disabled', false);
		} else {
			$(sampleDelim).attr('disabled', true);
		}
	});

	$(sampleDelim).on('change', function () { sampleHasChanged(true); });
	$(renderWs).on('change', setRenderWSfunc);
};

