# regex_tester
Regular Expression tester/find &amp; replace front end and API to interact with local (client) and server based regular expression engines.

## About
This project is a reimplementation of my earlier web based UI for [PHP's (PCRE) regular expression engine](https://github.com/evanwills/preg_test).

It's aim is to provide a way of testing regular expressions using a variety of regular expression engines. It also provides a way of doing sophisticated find and replace using multiple regular expressions applied sequentially to the supplied sample.

By using an API via HTTP you reduce the data being sent back and fourth to the server (which was a problem when applying regular expressions to a large chunk of text using the original [preg_test](https://github.com/evanwills/preg_test) version.)

Currently the only regex engine implemented is the vanilla JavaScript Engine. But most of the work is done for the xRegExp and PHP PCRE engines.

## API
### Post object
``` json
{
	'delimClose': '',		// single char
	'delimOpen': '',		// single char
	'doReplace': false,		// boolean
	'ok': true,				// boolean
	'matchResultLen': 300,	// int > 6
	'regexPairs': [			// array of objects:
		{
			'id': 0,
			'ok': false,
			'find': '',
			'replace': '', 'modifiers': ''
		},
		{...}
	],
	'sample': [],			// array of strings
	'sampResultLen': 300,	// int > 6
	'trimOutput': false,	// boolean
	'url': false			// boolean
}
```

### Return object
#### when doReplace is FALSE:
``` json
{
	'doReplace': false,		// boolean
	'message': '',			// general error messages if any.
	'regexErrors': [
		{
			'regexID': [int],	// required
			'message': [string],	// required
			'patternParts': {	// optional (if supported)
				'good': '',
				'problem': '',
				'bad': ''
			}
		},
		{...}
	],
	'samples': [
		{
			'sampleID': [int]
			'sampeMatches': [
				{
					'regexID': [int],
					'ok': [bool],
					'matched': [bool]
					'matches': [
						{
							'wholeMatch': [string],
							'subPatterns': [
								[string],
								...
							]
						},
						{...}

					],
					'seconds': [float] // how long it took to apply the regex to the sample
				},
				{...}
			]
		}
	],
	'success': [bool]
}
```
#### when doReplace is TRUE:
Only the find/replace output is returned.
``` json
{
	'doReplace': true,	// boolean
	'message': '',		// general error messages if any.
	'samples': [
		[string],
		...
	],
	'success': [bool],
}
```

## Roadmap
1.	Get PHP API service up and running using the base code from [preg_tester](https://github.com/evanwills/preg_test).
2.	Remove jQuery dependancy.
3.	Add .Net API service