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
		trimSampleOutput = false,
		regexDelim = '#regex_delim',
		regexDoer,
		sampleDelim = '#split_delim',
		sampleField = '#sample',
		splitSample = '#split_sample',
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

	function setRenderWSfunc(e) {
		if ($(e.target).val() === 1) {
			doRenderWS = function (input) {
				var a = 0,
					find = [],
					replace = [];

				if (typeof input !== 'string') {
					throw { message: 'renderWS() expects first input to be a string. ' + typeof input + 'given.' };
				}

				find.push(new RegExp(' ', 'g'));
				replace.push('<span class="spc">[space]</space>');
				find.push(new RegExp("\n", 'g'));
				replace.push('<span class="spc">[new line]</space>');
				find.push(new RegExp("\r", 'g'));
				replace.push('<span class="spc">[return]</space>');
				find.push(new RegExp("\l", 'g'));
				replace.push('<span class="spc">[line feed]</space>');
				find.push(new RegExp("\t", 'g'));
				replace.push('<span class="spc">[tab]</space>');

				for (a = 0; a < find.length; a += 1) {
					input = input.replace(find[a], replace[a]);
				}
				return input;
			}
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

	/**
	 * @function removePair() removes a regexPair block (and
	 *			 renumbers all subsequent regexPair blocks)
	 *
	 * @var [int] id ID of regexPair block to be removed
	 */
	function removePair(id) {
		var a = 0,
			tmpNewID = 0;

		$('#addBefore' + id).off('click');
		$('#addAfter' + id).off('click');
		$('#remove' + id).off('click');

		$('#regexp' + id).remove();
		console.log('inside removePair');
		console.log('id:', id);
		console.log('$(#regexes-pairs li).length', $('#regexes-pairs li').length);
		console.log((id + 1) <= $('#regexes-pairs li').length);
		updatePairs();
	}

	/**
	 * @function addNewPair() adds a new pair either before or after
	 *			 the appropriate regexPair block
	 *
	 * @var [int] id ID of regexPair block to be removed
	 * @var [str] pos Position to add ('before' or 'after')
	 */
	function addNewPair(id, pos) {
		var a = 0,
			nextID,
			tmpPair,
			textarea = false;

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
				parsedSample = parsedSample[0].split(new RegExp($(sampleDelim).val(), 'g'));
			}

			trimSampleOutput = false;
			if ($(wsTrim).is(':checked')) {
				if ($('#ws_trim_pos_before').is(':checked')) {
					for (a = 0; a < parsedSample.length; a += 1) {
						parsedSample[a] = parsedSample[a].trim();
					}
				} else {
					trimSampleOutput = true;
				}
			}
			sampleHasChanged(false);
		}
	}

	function getRegexPair(id) {
		var output = { id: 0, ok: false, 'find': '', 'replace': '', 'modifiers': '' };

		if (typeof id !== 'number') {
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
				'sample': [],
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
		jsonObj.trimOutput = trimSampleOutput;
		jsonObj.sample = parsedSample;

		if ($('.regexPair').length > 0) {
			jsonObj.regexPairs = [];
			$('#regexes-pairs .regexPair').each(function () {
				var newPair = {},
					newPairID = 0;

				if ($(this).data('regex') !== undefined && typeof ($(this).data('regex') * 1) === 'number') {
					newPairID = ($(this).data('regex') * 1);
				} else {
					throw 'buildJSONobject() expects each regexPair block to have a data attribute named "regex" with a numeric value';
				}

				newPair = getRegexPair(newPairID);

				jsonObj.regexPairs.push(newPair);
			});
		}

		jsonObj.sampResultLen = ($(maxLenSamp).val() * 1);
		jsonObj.matchResultLen = ($(maxLenMatch).val() * 1);

		trimSampleOutput = jsonObj.trimOutput;

		console.log(jsonObj);
		return jsonObj;
	}

	function renderProblemRegex() {}

	function HtmlEncode(input) {
		var el = document.createElement("div");
		el.innerText = el.textContent = input;
		return el.innerHTML;
	}

	function renderReturn(input, jsonObj) {
		var a = 0;
		console.log('inside renderReturn()');
		console.log('input: ', input);
		console.log('jsonObj: ', jsonObj);

		if (typeof input !== 'array') {
			throw {'message': 'renderReturn() expects first parameter [input] to be an array containing the object returned from a regexDoer. ' typeof input + ' given.'};
		}

		for (a = 0; a < input.length; a += 1) {

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
				console.log(regexDoer);
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
			throw 'RegexTest::setCustomFieldID() expects fieldID to be a string. ' + typeof fieldName + ' given.';
		} else if ($(fieldID).length === 0) {
			throw 'RegexTest::setCustomFieldID() expects fieldID to be an existing form field ID. "' + fieldID + '" does not exist.';
		}
		if (typeof fieldName !== 'string') {
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
			throw 'RegexTest::setCustomFieldID() expects fieldName to be one of the following "regexDelim", "sampleField", "maxLenSamp", "maxLenMatch", "wsTrim", "wsAction", "splitSample" or "sampleDelim". "' + fieldName + '" given';
		}
	};

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

		console.log(this);
		for (a = 0; a < engines.length; a += 1) {
			if (engines[a].getName() === $(this).val()) {
				console.log(this);
				workingEngine = engines[a];
				$('.modifiers').each(setPattern);
				if (workingEngine.validateDelim(regexDelim) !== true) {
					$(regexDelim).val(workingEngine.getDelimOpen());
				}
				break;
			}
		}
		if (workingEngine.getURL() === false) {

			if (workingEngine.getName() === 'Vanilla JS') {
				console.log('using $.RegexDoerLocal (Vanilla JS mode)');
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

