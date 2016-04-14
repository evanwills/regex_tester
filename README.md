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
	'doReplace': false,		// [boolean]
	'matchResultLen': 300,	// [int] > 6
	'regexPairs': [			// [array] list of regexPair objects:
		{
			'id': 0,		// [int]	ID of the regex to be matched
			'find': '',		// [string]	regex pattern to be tested/used
			'replace': '',	// [string]	replacement pattern
			'modifiers': '' // [string]	alpha character
		},
		{...}
	],
	'samples': [
		[string],
		...
	],			// [array] list of strings
	'sampResultLen': 300,	// [int] > 6
	'trimOutput': false,	// [boolean]
}
```

### Return object
#### when doReplace is FALSE:
``` javascript
{
	'matched': true,		// [boolean] whether or not anything at all was matched
	'message': '',			// [string] general error messages if any (e.g. "server error", "page not found")
	'regexErrors': [
		{
			'regexID': 0,		// [int] [required] ID of the regex that had a problem
			'message': '',		// [string] [required]
			'patternParts': {		// optional (if supported)
				'good': '',			// [string] good part of the regex
				'problem': '',		// [string] problem part of the regex
				'bad': ''			// [string] bad part of the regex
			}
		},
		{...}
	],
	'samples': [
		{
			'sampleID': 0			// [int] ID of the sample that was matched
			'sampeMatches': [		// [array] list of sampleMatch objects
				{
					'regexID': 0,		// [int] ID of the regex that was matched
					'ok': true,			// [bool] was the regex OK (true if there were no errors)
					'matched': true		// [bool] true if the regex matched anything at all
					'matches': [		// [array] list of matches
						{
							'wholeMatch': '',	// [string] list of the whole match
							'subPatterns': [	// [array] list of sub-parts of the match
								[string],
								...
							]
						},
						{...}

					],
					'seconds': 0.002	// [float] how many seconds it took to apply the regex to the sample
				},
				{ // regex has errors
					'regexID': 0,		// [int] ID of the regex that was matched
					'ok': false,		// [bool] was the regex OK (true if there were no errors)
				},
				{...}				// sampleMatch objects
			]
		}
	],
	'success': true,	// [boolean] whether or not there were any problems
}
```

#### when doReplace is TRUE:

Only the find/replace output is returned.

__NOTE__: If nothing was matched but there were no errors, 'matched' must be false and 'samples' should be empty (no point returning something we already have.)

``` javascript
{
	'matched': false,	// [boolean] whether or not anything at all was matched
	'message': '',		// [string] general error messages if any.
	'regexErrors': [
		{
			'regexID': 0,		// [int] [required] ID of the regex that had a problem
			'message': '',		// [string] [required]
			'patternParts': {	// optional (if supported)
				'good': '',		// [string] good part of the regex
				'problem': '',	// [string] problem part of the regex
				'bad': ''		// [string] bad part of the regex
			}
		},
		{...}
	],
	'samples': [
		[string],
		...
	],
	'success': true,	// [boolean]
}
```

## Roadmap
1.	Get PHP API service up and running using the base code from [preg_tester](https://github.com/evanwills/preg_test).
3.	Add .Net API service
3.	Add branches for:
	*	vanilla javascript (i.e. no jQuery or any other framework)
	*	[Ember JS](https://emberjs.com/)
	*	[Angular JS](https:angularjs.org/)
	*	[Ractive JS](http://ractivejs.org/)
	*	[React JS](https://facebook.github.io/react)
4.	move jQuery version to its own branch and push vanilla javascript version to master