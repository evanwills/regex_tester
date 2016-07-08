
/**
 * @function setIDitem() replaces keywords in input with id value
 *
 * @param [str] input string to be updated
 * @param [int] id value to replace keyword
 *
 * @return [str] updated value of input
 */
function setIDitem(input, id) {
	'use strict';
	input = input.replace(/\{\{ID\}\}/g, id);
	return input.replace(/\{\{ITEM\}\}/g, (id + 1));
}

/**
 * @funciton htmlEncode() converts HTML special characters to HTML
 * character entities which can then be rendered safely to view the
 * HTML code as a visible part of the page.  (e.g. '<', '>' ,'&' etc)
 *
 * @param   {string} input HTML code to be encoded for screen
 *
 * @return {string} screen ready entity encoded HTML.
 */
function htmlEncode(input) {
	'use strict';
	var el = document.createElement("div"),
		reg = new RegExp('&amp;', 'g');
	el.innerText = el.textContent = input;
	el.innerText = el.innerText.replace(reg, '&');
	return el.innerHTML;
}

/**
 * @function returns a function to be used for handling rendering
 *           white space in samples and matches
 *
 * NOTE: This also handles converting the HTML special chars into
 *       HTML character entitites using the htmlEncode() function
 *
 * @param {boolean}  input TRUE if white space should be encoded.
 *                         FALSE otherwise
 *
 * @return {function} a function for changing (or not changing) how
 *                    white space is rendered for samples, matches
 *                    and output
 */
function setRenderWSfunc(input) {
	'use strict';
	var a = 0,
		char = [' ', "\t", "\n", "\r"],
		find = { 'before': [], 'after': [] },
		msgSRWSF = '',
		replace = { 'before': [], 'after': [] },
		str = ['space', 'tab', 'new line', 'return'];


	if (typeof input !== 'boolean') {
		msgSRWSF = 'setRenderWSfunc() requires only param to be boolean. "' + typeof input + '" given.';
		console.warn(msgSRWSF);
		throw {message: msgSRWSF};
	}
	if (input === true) {

		for (a = 0; a < 4; a += 1) {
			find.before.push(new RegExp(char[a], 'g'));
			replace.before.push('[[[' + str[a] + ']]]');
			if (a > 1) {
				find.after.push(new RegExp('(\\[{3}' + str[a] + '\\]{3})', 'g'));
				replace.after.push('$1' + char[a]);
			}
		}

		return function (input) {
			var a = 0,
				msgRWS = '';

			if (typeof input !== 'string') {
				msgRWS = 'renderWS() expects first input to be a string. ' + typeof input + 'given.';
				console.warn(msgRWS);
				throw {message: msgRWS};
			}

			for (a = 0; a < find.before.length; a += 1) {
				input = input.replace(find.before[a], replace.before[a]);
			}
			input = htmlEncode(input);

			for (a = 0; a < find.after.length; a += 1) {
				input = input.replace(find.after[a], replace.after[a]);
			}
			input = input.replace(/\[{2}(\[(?:space|new line|return|line feed|tab)\])\]{2}/g, '<span class="spc">$1</span>');
			return input;
		};
	} else {
		return function (input) { return htmlEncode(input); };
	}
}

function outputEscaptedWSchars(input) {
	var a = 0,
		find = [
			new RegExp('\\\\n', 'g'),
			new RegExp('\\\\r', 'g'),
			new RegExp('\\\\t', 'g')
		],
		replace = [
			"\n",
			"\r",
			"	"
		]
	for (a = 0; a < 3; a += 1) {
		input = input.replace(find[a],replace[a]);
	}
	return input;
}