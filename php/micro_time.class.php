<?php

abstract class micro_time
{
	const REGEX = '/^0(\.[0-9]+) ([0-9]+)$/';
	static protected $singleton = null;
	protected function __construct() {}

/**
 * @method mt_subtract() retuns the time difference between two
 * microtime results
 *
 * Because of PHPs rounding off of floats when you're finding the
 * difference between two microtime values it's necessary to fiddle
 * with the floating point precision
 *
 * @param string $start microtime() from just before regex was run
 * @param string $end microtime() from just after regex was run
 *
 * @return string difference between $start and $end
 */
	abstract public function mt_subtract( $start , $end );

/**
 * @method get_obj() returns the microtime handlerthat will work on
 *	   this system
 * @param void
 * @return object
 */
	public static function get_obj()
	{
		if( self::$singleton === null) {
			if( function_exists('bcsub') )
			{
				self::$singleton = new micro_time_bc();
			}
			elseif( function_exists('gmp_strval') )
			{
				self::$singleton = new micro_time_gmp();
			}
			else
			{
				self::$singleton = new micro_time_basic();
			}
		}
		return self::$singleton;
	}

}

class micro_time_bc extends micro_time
{
/**
 * @method mt_subtract() retuns the time difference between two
 * microtime results
 *
 * Because of PHPs rounding off of floats when you're finding the
 * difference between two microtime values it's necessary to fiddle
 * with the floating point precision
 *
 * @param string $start microtime() from just before regex was run
 * @param string $end microtime() from just after regex was run
 *
 * @return string difference between $start and $end
 */
	public function mt_subtract( $start , $end )
	{
		return bcsub(
			 preg_replace( self::REGEX , '\2\1' , $end )
			,preg_replace( self::REGEX , '\2\1' , $start )
			,8
		);
	}
}

class micro_time_gmp extends micro_time
{
/**
 * @method mt_subtract() retuns the time difference between two
 * microtime results
 *
 * Because of PHPs rounding off of floats when you're finding the
 * difference between two microtime values it's necessary to fiddle
 * with the floating point precision
 *
 * @param string $start microtime() from just before regex was run
 * @param string $end microtime() from just after regex was run
 *
 * @return string difference between $start and $end
 */
	public function mt_subtract( $start , $end )
	{
		return preg_replace(
			  '/(?<=\.[0-9]{8}).*$/'
			 ,''
			 ,gmp_strval(
				gmp_sub(
					 preg_replace( self::REGEX , '\2\1' , $end )
					,preg_replace( self::REGEX , '\2\1' , $start )
				)
			 )
		);

	}
}
