# regex_tester
Regular Expression tester/find &amp; replace front end and API to interact with local (client) and server based regular expression engines.

## About
This project is a reimplementation of my earlier web based UI for PHP's (PCRE) regular expression engine.

Currently the only regex engine implemented is the vanilla JavaScript Engine. But most of the work is done for the xRegExp and PHP PCRE engines.

## API
### Post object
``` JSON
{
	'delimClose': '',		// single char
	'delimOpen': '',		// single char
	'doReplace': false,		// boolean
	'ok': true,				// boolean
	'matchResultLen': 300,	// int > 6
	'regexPairs': [			// array of objects:
		{
			id: 0,
			ok: false,
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
``` JSON
{
	'success': [bool],
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
							wholeMatch: [string],
							subPatterns: [
								[string],
								[string],
								...
							]
						},
						{...}

					]
				},
				{...}
			]
		}
	],
	'message': ''
}
```
#### when doReplace is TRUE:
Only the find/replace output is returned.
``` JSON
{
	'success': [bool],
	'samples': [
		[string],
		...
	],
	'message': ''
}
```

## Roadmap
1.	Get PHP API service up and running using the base code from [preg_tester](https://github.com/evanwills/preg_test).
2.	Remove jQuery dependancy.
3.	Add .Net API service