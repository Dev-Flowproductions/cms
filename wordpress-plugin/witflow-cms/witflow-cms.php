<?php
/**
 * Plugin Name:       Witflow CMS
 * Plugin URI:        https://witflow.io
 * Description:       Connect WordPress to Witflow CMS — receive published posts via webhook and sync pt/en/fr with Polylang.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Witflow
 * License:           GPL-2.0-or-later
 * Text Domain:       witflow-cms
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

define( 'WITFLOW_CMS_VERSION', '1.0.0' );
define( 'WITFLOW_CMS_FILE', __FILE__ );
define( 'WITFLOW_CMS_PATH', plugin_dir_path( __FILE__ ) );
define( 'WITFLOW_CMS_URL', plugin_dir_url( __FILE__ ) );
define( 'WITFLOW_CMS_OPTION', 'witflow_cms_settings' );

require_once WITFLOW_CMS_PATH . 'vendor/Parsedown.php';
require_once WITFLOW_CMS_PATH . 'includes/class-auth.php';
require_once WITFLOW_CMS_PATH . 'includes/class-markdown.php';
require_once WITFLOW_CMS_PATH . 'includes/class-media.php';
require_once WITFLOW_CMS_PATH . 'includes/class-seo.php';
require_once WITFLOW_CMS_PATH . 'includes/class-i18n.php';
require_once WITFLOW_CMS_PATH . 'includes/class-api-client.php';
require_once WITFLOW_CMS_PATH . 'includes/class-post-sync.php';
require_once WITFLOW_CMS_PATH . 'includes/class-rest-webhook.php';
require_once WITFLOW_CMS_PATH . 'includes/class-settings.php';
require_once WITFLOW_CMS_PATH . 'includes/class-plugin.php';

/**
 * Plugin bootstrap.
 *
 * @return Witflow_CMS_Plugin
 */
function witflow_cms() {
	return Witflow_CMS_Plugin::instance();
}

register_activation_hook( __FILE__, array( 'Witflow_CMS_Plugin', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Witflow_CMS_Plugin', 'deactivate' ) );

add_action( 'plugins_loaded', 'witflow_cms' );
