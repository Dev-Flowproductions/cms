<?php
/**
 * Uninstall cleanup.
 *
 * @package Witflow_CMS
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'witflow_cms_settings' );
