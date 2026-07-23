<?php
/**
 * Main plugin class.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Wires hooks and holds shared services.
 */
class Witflow_CMS_Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var Witflow_CMS_Plugin|null
	 */
	private static $instance = null;

	/**
	 * Settings handler.
	 *
	 * @var Witflow_CMS_Settings
	 */
	public $settings;

	/**
	 * Post sync handler.
	 *
	 * @var Witflow_CMS_Post_Sync
	 */
	public $sync;

	/**
	 * REST webhook controller.
	 *
	 * @var Witflow_CMS_REST_Webhook
	 */
	public $webhook;

	/**
	 * Get singleton.
	 *
	 * @return Witflow_CMS_Plugin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->settings = new Witflow_CMS_Settings();
		$this->sync     = new Witflow_CMS_Post_Sync();
		$this->webhook  = new Witflow_CMS_REST_Webhook( $this->sync );

		add_action( 'rest_api_init', array( $this->webhook, 'register_routes' ) );
		add_action( 'admin_menu', array( $this->settings, 'register_menu' ) );
		add_action( 'admin_init', array( $this->settings, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this->settings, 'enqueue_assets' ) );
		add_action( 'admin_notices', array( $this, 'maybe_polylang_notice' ) );
		add_action( 'wp_head', array( 'Witflow_CMS_SEO', 'print_json_ld' ), 5 );

		add_action( 'admin_post_witflow_cms_test_connection', array( $this->settings, 'handle_test_connection' ) );
		add_action( 'admin_post_witflow_cms_sync_now', array( $this->settings, 'handle_sync_now' ) );
	}

	/**
	 * Activation: flush rewrite rules so REST routes are discoverable.
	 */
	public static function activate() {
		$defaults = array(
			'cms_base_url'    => '',
			'site_id'         => '',
			'api_key'         => '',
			'webhook_secret'  => '',
			'default_locale'  => 'en',
			'post_status'     => 'publish',
			'author_id'       => 0,
			'locale_map'      => array(
				'pt' => 'pt',
				'en' => 'en',
				'fr' => 'fr',
			),
		);
		if ( false === get_option( WITFLOW_CMS_OPTION ) ) {
			add_option( WITFLOW_CMS_OPTION, $defaults );
		}
		flush_rewrite_rules();
	}

	/**
	 * Deactivation.
	 */
	public static function deactivate() {
		flush_rewrite_rules();
	}

	/**
	 * Admin notice when multi-locale sites lack Polylang.
	 */
	public function maybe_polylang_notice() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( Witflow_CMS_I18n::polylang_active() ) {
			return;
		}
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || 'settings_page_witflow-cms' !== $screen->id ) {
			return;
		}
		echo '<div class="notice notice-warning"><p>';
		echo esc_html__(
			'Witflow CMS: Polylang is required to sync multiple locales (pt/en/fr). Single-locale payloads still work without it.',
			'witflow-cms'
		);
		echo '</p></div>';
	}

	/**
	 * Get merged settings.
	 *
	 * @return array
	 */
	public static function get_settings() {
		$defaults = array(
			'cms_base_url'   => '',
			'site_id'        => '',
			'api_key'        => '',
			'webhook_secret' => '',
			'default_locale' => 'en',
			'post_status'    => 'publish',
			'author_id'      => 0,
			'locale_map'     => array(
				'pt' => 'pt',
				'en' => 'en',
				'fr' => 'fr',
			),
		);
		$stored = get_option( WITFLOW_CMS_OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}
		$settings = wp_parse_args( $stored, $defaults );
		if ( empty( $settings['locale_map'] ) || ! is_array( $settings['locale_map'] ) ) {
			$settings['locale_map'] = $defaults['locale_map'];
		}
		return $settings;
	}
}
