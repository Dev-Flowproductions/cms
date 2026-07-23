<?php
/**
 * Polylang integration for pt/en/fr.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Links translated posts via Polylang.
 */
class Witflow_CMS_I18n {

	/**
	 * Supported CMS locales.
	 *
	 * @return string[]
	 */
	public static function supported_locales() {
		return array( 'pt', 'en', 'fr' );
	}

	/**
	 * Whether Polylang is available.
	 *
	 * @return bool
	 */
	public static function polylang_active() {
		return function_exists( 'pll_set_post_language' )
			&& function_exists( 'pll_save_post_translations' )
			&& function_exists( 'pll_languages_list' );
	}

	/**
	 * Map a CMS locale to a Polylang language slug using settings.
	 *
	 * @param string $cms_locale CMS locale (pt|en|fr).
	 * @return string
	 */
	public static function map_locale( $cms_locale ) {
		$settings = Witflow_CMS_Plugin::get_settings();
		$map      = isset( $settings['locale_map'] ) && is_array( $settings['locale_map'] )
			? $settings['locale_map']
			: array();
		if ( isset( $map[ $cms_locale ] ) && is_string( $map[ $cms_locale ] ) && '' !== $map[ $cms_locale ] ) {
			return $map[ $cms_locale ];
		}
		return $cms_locale;
	}

	/**
	 * Ensure Polylang language exists for a CMS locale.
	 *
	 * @param string $cms_locale CMS locale.
	 * @return true|WP_Error
	 */
	public static function ensure_language( $cms_locale ) {
		if ( ! self::polylang_active() ) {
			return new WP_Error(
				'witflow_cms_polylang_missing',
				__( 'Polylang is required for multi-locale sync.', 'witflow-cms' )
			);
		}

		$pll_slug = self::map_locale( $cms_locale );
		$langs    = pll_languages_list( array( 'fields' => 'slug' ) );
		if ( ! is_array( $langs ) ) {
			$langs = array();
		}

		if ( in_array( $pll_slug, $langs, true ) ) {
			return true;
		}

		return new WP_Error(
			'witflow_cms_language_missing',
			sprintf(
				/* translators: 1: Polylang language slug, 2: CMS locale */
				__( 'Polylang language "%1$s" is not configured (needed for CMS locale "%2$s"). Add it in Languages settings.', 'witflow-cms' ),
				$pll_slug,
				$cms_locale
			)
		);
	}

	/**
	 * Assign language and link translation group.
	 *
	 * @param array $post_ids_by_locale Map of CMS locale => WP post ID.
	 * @return true|WP_Error
	 */
	public static function link_translations( array $post_ids_by_locale ) {
		if ( count( $post_ids_by_locale ) <= 1 ) {
			if ( self::polylang_active() && ! empty( $post_ids_by_locale ) ) {
				foreach ( $post_ids_by_locale as $locale => $post_id ) {
					$check = self::ensure_language( $locale );
					if ( is_wp_error( $check ) ) {
						return $check;
					}
					pll_set_post_language( (int) $post_id, self::map_locale( $locale ) );
				}
			}
			return true;
		}

		if ( ! self::polylang_active() ) {
			return new WP_Error(
				'witflow_cms_polylang_required',
				__( 'Polylang is required to sync multiple locales (pt/en/fr). Install and activate Polylang, then retry publish.', 'witflow-cms' ),
				array( 'status' => 503 )
			);
		}

		$translations = array();
		foreach ( $post_ids_by_locale as $locale => $post_id ) {
			$check = self::ensure_language( $locale );
			if ( is_wp_error( $check ) ) {
				return $check;
			}
			$pll_slug                   = self::map_locale( $locale );
			pll_set_post_language( (int) $post_id, $pll_slug );
			$translations[ $pll_slug ] = (int) $post_id;
		}

		pll_save_post_translations( $translations );
		return true;
	}
}
