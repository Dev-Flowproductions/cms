<?php
/**
 * Webhook authentication helpers.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Verifies CMS webhook signatures and secrets.
 */
class Witflow_CMS_Auth {

	/**
	 * Verify request auth against configured webhook secret.
	 *
	 * Accepts either:
	 * - x-webhook-secret header equal to the secret, or
	 * - x-cms-signature = HMAC-SHA256(rawBody, secret) hex
	 *
	 * @param string      $raw_body Raw request body.
	 * @param string|null $header_secret Value of x-webhook-secret.
	 * @param string|null $signature Value of x-cms-signature.
	 * @param string      $secret Configured webhook secret.
	 * @return bool
	 */
	public static function verify( $raw_body, $header_secret, $signature, $secret ) {
		if ( ! is_string( $secret ) || '' === trim( $secret ) ) {
			return false;
		}

		$secret = (string) $secret;

		if ( is_string( $header_secret ) && self::hash_equals( $secret, $header_secret ) ) {
			return true;
		}

		if ( is_string( $signature ) && '' !== $signature ) {
			$expected = hash_hmac( 'sha256', $raw_body, $secret );
			return self::hash_equals( $expected, $signature );
		}

		return false;
	}

	/**
	 * Timing-safe string compare.
	 *
	 * @param string $known Known value.
	 * @param string $user  User-supplied value.
	 * @return bool
	 */
	public static function hash_equals( $known, $user ) {
		if ( ! is_string( $known ) || ! is_string( $user ) ) {
			return false;
		}
		if ( function_exists( 'hash_equals' ) ) {
			return hash_equals( $known, $user );
		}
		if ( strlen( $known ) !== strlen( $user ) ) {
			return false;
		}
		$result = 0;
		$len    = strlen( $known );
		for ( $i = 0; $i < $len; $i++ ) {
			$result |= ord( $known[ $i ] ) ^ ord( $user[ $i ] );
		}
		return 0 === $result;
	}
}
