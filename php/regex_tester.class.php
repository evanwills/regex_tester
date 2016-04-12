<?php

class regex_tester {
	protected $find = '';
	protected $replace = '';
	protected $modifiers = '';
	protected $id = 0;

	static protected $delim_open = '`';
	static protected $delim_close = '`';

	public function __construct($find, $modifiers, $replace, $id)
	{

	}

	public function get_errors()
	{

	}

	public function match($sample)
	{
		$micro = micro_time::get_obj();

	}

	public function replace($sample)
	{

	}
}