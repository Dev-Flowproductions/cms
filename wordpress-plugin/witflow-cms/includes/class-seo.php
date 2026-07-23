<?php
/**
 * SEO meta helpers (Yoast / Rank Math / fallback).
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Writes SEO fields and outputs JSON-LD when needed.
 */
class Witflow_CMS_SEO {

	/**
	 * Apply SEO metadata to a post.
	 *
	 * @param int   $post_id WP post ID.
	 * @param array $fields  Keys: seo_title, meta_description, json_ld.
	 */
	public static function apply( $post_id, array $fields ) {
		$post_id          = (int) $post_id;
		$seo_title        = isset( $fields['seo_title'] ) ? (string) $fields['seo_title'] : '';
		$meta_description = isset( $fields['meta_description'] ) ? (string) $fields['meta_description'] : '';
		$json_ld          = isset( $fields['json_ld'] ) ? $fields['json_ld'] : null;

		update_post_meta( $post_id, '_witflow_cms_seo_title', sanitize_text_field( $seo_title ) );
		update_post_meta( $post_id, '_witflow_cms_meta_description', sanitize_textarea_field( $meta_description ) );

		$json_ld_string = self::normalize_json_ld( $json_ld );
		if ( null !== $json_ld_string ) {
			update_post_meta( $post_id, '_witflow_cms_json_ld', $json_ld_string );
		} else {
			delete_post_meta( $post_id, '_witflow_cms_json_ld' );
		}

		if ( defined( 'WPSEO_VERSION' ) || class_exists( 'WPSEO_Meta', false ) ) {
			if ( $seo_title ) {
				update_post_meta( $post_id, '_yoast_wpseo_title', sanitize_text_field( $seo_title ) );
			}
			if ( $meta_description ) {
				update_post_meta( $post_id, '_yoast_wpseo_metadesc', sanitize_textarea_field( $meta_description ) );
			}
		}

		if ( defined( 'RANK_MATH_VERSION' ) || class_exists( 'RankMath', false ) ) {
			if ( $seo_title ) {
				update_post_meta( $post_id, 'rank_math_title', sanitize_text_field( $seo_title ) );
			}
			if ( $meta_description ) {
				update_post_meta( $post_id, 'rank_math_description', sanitize_textarea_field( $meta_description ) );
			}
		}
	}

	/**
	 * Print JSON-LD on singular posts that have CMS structured data and no SEO plugin.
	 */
	public static function print_json_ld() {
		if ( ! is_singular( 'post' ) ) {
			return;
		}

		if ( defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) ) {
			return;
		}

		$post_id = get_queried_object_id();
		if ( ! $post_id ) {
			return;
		}

		$json_ld = get_post_meta( $post_id, '_witflow_cms_json_ld', true );
		if ( ! is_string( $json_ld ) || '' === trim( $json_ld ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON-LD must remain valid JSON.
		echo '<script type="application/ld+json">' . $json_ld . '</script>' . "\n";
	}

	/**
	 * Normalize json_ld field to a JSON string.
	 *
	 * @param mixed $json_ld Raw value from CMS.
	 * @return string|null
	 */
	private static function normalize_json_ld( $json_ld ) {
		if ( null === $json_ld || '' === $json_ld ) {
			return null;
		}
		if ( is_string( $json_ld ) ) {
			$decoded = json_decode( $json_ld, true );
			if ( JSON_ERROR_NONE !== json_last_error() ) {
				return null;
			}
			return wp_json_encode( $decoded );
		}
		if ( is_array( $json_ld ) || is_object( $json_ld ) ) {
			return wp_json_encode( $json_ld );
		}
		return null;
	}
}
