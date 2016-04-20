# regex_tester
Regular Expression tester/find &amp; replace front end and API to interact with local (client) and server based regular expression engines.

## About
This project is a reimplementation of my earlier web based UI for [PHP's (PCRE) regular expression engine](https://github.com/evanwills/preg_test).

It's aim is to provide a way of testing regular expressions using a variety of regular expression engines. It also provides a way of doing sophisticated find and replace using multiple regular expressions applied sequentially to the supplied sample.

By using an API via HTTP you reduce the data being sent back and fourth to the server (which was a problem when applying regular expressions to a large chunk of text using the original [preg_test](https://github.com/evanwills/preg_test) version.)

Currently the only regex engine implemented is the vanilla JavaScript Engine. But most of the work is done for the xRegExp and PHP PCRE engines.

## API
### Post object
``` javascript
{
	'delimClose': '',		// [string] single char
	'delimOpen': '',		// [string] single char
	'doReplace': false,		// [boolean] [required]
	'matchResultLen': 300,	// [integer] > 6
	'regexPairs': [			// [array] [required] list of regexPair objects:
		{
			'id': 0,		// [integer] [required]	ID of the regex to be matched
			'find': '',		// [string] [required]	regex pattern to be tested/used
			'replace': '',	// [string] [required]	replacement pattern
			'modifiers': '' // [string] [required]	alpha character
		},
		{...}
	],
	'samples': [	 // [array][required]
		[string],
		...
	],			// [array] list of strings
	'sampResultLen': 300,	// [integer] > 6
	'trimOutput': false,	// [boolean]
}
```

### Return object
#### when doReplace is FALSE:
``` javascript
{
	'matched': true,		// [boolean] [required] whether or not anything at all was matched
	'message': [],			// [array] [required] list of general (recoverable) error messages if any.
	'regexErrors': [
		{
			'regexID': 0,		// [integer] [required] ID of the regex that had a problem
			'message': '',		// [string] [required]
			'patternParts': {	// [object] [optional] (if supported)
				'good': '',			// [string] [required] good part of the regex
				'problem': '',		// [string] [required] problem part of the regex
				'bad': ''			// [string] [required] bad part of the regex
			}
		},
		{...}
	],
	'samples': [
		{
			'sampleID': 0			// [integer] [required] ID of the sample that was matched
			'sampeMatches': [		// [array] list of sampleMatch objects
										// When regex was OK and matched something in the sample
				{
					'regexID': 0,		// [integer] [required] ID of the regex that was matched
					'ok': true,			// [boolean] [required] was the regex OK (true if there were no errors)
					'matched': true,	// [boolean] [required] (if regex is ok) true if the regex matched anything at all
					'matches': [		// [array] [required] (if regex is ok) list of matches
						{
							'wholeMatch': '',	// [string] [required] list of the whole match
							'subPatterns': [	// [array] [required] list of sub-parts of the match (if any)
								[string],
								...
							]
						},
						{...}

					],
					'seconds': 0.002	// [float] [optional] how many seconds it took to apply the regex to the sample
				},
										// When regex is OK but didn't match anything in the sample
				{
					'regexID': 0,		// [integer] [required] ID of the regex that was matched
					'ok': true,			// [boolean] [required] was the regex OK (true if there were no errors)
					'matched': false,	// [boolean] [required] (if regex is ok) true if the regex matched anything at all
					'matches': []		// [array] [required] (if regex is ok) empty list
					'seconds': 0.002	// [float] [optional] how many seconds it took to apply the regex to the sample
				},
										// When regex had problem
				{						// regex has errors
					'regexID': 0,		// [integer] [required] ID of the regex that was matched
					'ok': false,		// [boolean] [required] was the regex OK (true if there were no errors)
				},
				{...}				// sampleMatch objects
			]
		}
	],
	'success': true,	// [boolean] [required] whether or not there were any problems
}
```

#### when doReplace is TRUE:

Only the find/replace output is returned.

__NOTE__: If nothing was matched but there were no errors, 'matched' must be false and 'samples' should be empty (no point returning something we already have.)

``` javascript
{
	'matched': true,	// [boolean] [required] whether or not anything at all was matched
	'message': [],		// [array] [required] list of general (recoverable) error messages if any.
	'regexErrors': [
		{
			'regexID': 0,		// [integer] [required] ID of the regex that had a problem
			'message': '',		// [string] [required]
			'patternParts': {	// [object] [optional] (if supported)
				'good': '',			// [string] [required] good part of the regex
				'problem': '',		// [string] [required] problem part of the regex
				'bad': ''			// [string] [required] bad part of the regex
			}
		},
		{...}
	],
	'samples': []	// [array] [required] list of modified sample strings (in the same order as they were received.)
		[string],	// [string] [optional]
		...
	],
	'success': true	// [boolean] [required] TRUE if there were no unrecoverable errors (see below for more about errors)
}
```
#### when doReplace is True but nothing was matched:
``` javascript
{
	'matched': false,	// [boolean] [required] whether or not anything at all was matched
	'message': [],		// [array] [required] list of general (recoverable) error messages if any.
	'regexErrors': [
		{
			'regexID': 0,		// [integer] [required] ID of the regex that had a problem
			'message': '',		// [string] [required]
			'patternParts': {	// [object] [optional] (if supported)
				'good': '',			// [string] [required] good part of the regex
				'problem': '',		// [string] [required] problem part of the regex
				'bad': ''			// [string] [required] bad part of the regex
			}
		},
		{...}
	],
	'samples': [],		// [array] [required] must be an empty array - if nothing was matched then nothing changed. Don't send them something they already have.
	'success': true		// [boolean] [required]
}
```

#### When there is an unrecoverable error with the request or JSON object supplied:
``` javascript
{
	'success': false,
	'message': ''		// [string] [required] general error messages if any.
}
```
#### When there is a recoverable error with the request or JSON object supplied:
``` javascript
{
	'success': success,
	'message': [],		// [array] [required] list of general (recoverable) error messages (if any).
	'regexErrors': []	// [array] [required] list of regexError ojbects (if any)
	'samples': [],		// [array] [required] list of samples - see [when doReplace is FALSE](https://github.com/evanwills/regex_tester#when-doreplace-is-false) & [when doReplace is TRUE](https://github.com/evanwills/regex_tester#when-doreplace-is-true) above
	'matched': false
}
```

## Roadmap
1.	~~Get PHP API service up and running using the base code from [preg_tester](https://github.com/evanwills/preg_test).~~
3.	Add .Net API service
3.	Add branches for:
	*	vanilla javascript (i.e. no jQuery or any other framework)
	*	[Ember JS](https://emberjs.com/)
	*	[Angular JS](https:angularjs.org/)
	*	[Ractive JS](http://ractivejs.org/)
	*	[React JS](https://facebook.github.io/react) ([Shasta](http://shasta.tools/ "Opinionated React"))
4.	move jQuery version to its own branch and push vanilla javascript version to master