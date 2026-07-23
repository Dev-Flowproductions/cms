<?php
/**
 * REST webhook endpoint.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers POST /wp-json/witflow-cms/v1/webhook
 */
class Witflow_CMS_REST_Webhook {

	/**
	 * Sync service.
	 *
	 * @var Witflow_CMS_Post_Sync
	 */
	private $sync;

	/**
	 * @param Witflow_CMS_Post_Sync $sync Sync service.
	 */
	public function __construct( Witflow_CMS_Post_Sync $sync ) {
		$this->sync = $sync;
	}

	/**
	 * Register REST routes.
	 */
	public function register_routes() {
		register_rest_route(
			'witflow-cms/v1',
			'/webhook',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			'witflow-cms/v1',
			'/webhook',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'handle_get' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Reject GET (CMS uses POST only).
	 *
	 * @return WP_REST_Response
	 */
	public function handle_get() {
		return new WP_REST_Response(
			array( 'error' => 'Method not allowed' ),
			405
		);
	}

	/**
	 * Handle incoming CMS webhook.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function handle( WP_REST_Request $request ) {
		$settings = Witflow_CMS_Plugin::get_settings();
		$secret   = isset( $settings['webhook_secret'] ) ? (string) $settings['webhook_secret'] : '';

		if ( '' === trim( $secret ) ) {
			return new WP_REST_Response(
				array( 'error' => 'Webhook secret not configured' ),
				500
			);
		}

		$raw_body = $request->get_body();
		if ( ! is_string( $raw_body ) ) {
			$raw_body = '';
		}

		$header_secret = $request->get_header( 'x-webhook-secret' );
		$signature     = $request->get_header( 'x-cms-signature' );

		if ( ! Witflow_CMS_Auth::verify( $raw_body, $header_secret, $signature, $secret ) ) {
			return new WP_REST_Response(
				array( 'error' => 'Unauthorized' ),
				401
			);
		}

		$payload = json_decode( $raw_body, true );
		if ( ! is_array( $payload ) ) {
			return new WP_REST_Response(
				array( 'error' => 'Invalid JSON body' ),
				400
			);
		}

		$result = $this->sync->handle_payload( $payload );
		if ( is_wp_error( $result ) ) {
			$status = $result->get_error_data();
			$code   = is_array( $status ) && isset( $status['status'] ) ? (int) $status['status'] : 400;
			return new WP_REST_Response(
				array(
					'error' => $result->get_error_message(),
					'code'  => $result->get_error_code(),
				),
				$code
			);
		}

		return new WP_REST_Response( $result, 200 );
	}
}
