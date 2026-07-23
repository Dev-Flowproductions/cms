<?php
/**
 * CMS Content API client.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Pulls published posts from Witflow CMS v1 API.
 */
class Witflow_CMS_API_Client {

	/**
	 * Settings array.
	 *
	 * @var array
	 */
	private $settings;

	/**
	 * @param array|null $settings Optional settings override.
	 */
	public function __construct( $settings = null ) {
		$this->settings = is_array( $settings ) ? $settings : Witflow_CMS_Plugin::get_settings();
	}

	/**
	 * Test connectivity by listing published posts (page 1).
	 *
	 * @return array|WP_Error Decoded response or error.
	 */
	public function test_connection() {
		return $this->list_posts( 1, 1 );
	}

	/**
	 * List published posts.
	 *
	 * @param int $page  Page number.
	 * @param int $limit Page size.
	 * @return array|WP_Error
	 */
	public function list_posts( $page = 1, $limit = 20 ) {
		$path = sprintf(
			'/api/v1/sites/%s/posts?status=published&page=%d&limit=%d',
			rawurlencode( $this->settings['site_id'] ),
			(int) $page,
			(int) $limit
		);
		return $this->request( 'GET', $path );
	}

	/**
	 * Get a full post by slug.
	 *
	 * @param string      $slug   Post slug.
	 * @param string|null $locale Optional locale.
	 * @return array|WP_Error
	 */
	public function get_post( $slug, $locale = null ) {
		$path = sprintf(
			'/api/v1/sites/%s/posts/%s',
			rawurlencode( $this->settings['site_id'] ),
			rawurlencode( $slug )
		);
		if ( $locale ) {
			$path .= '?locale=' . rawurlencode( $locale );
		}
		return $this->request( 'GET', $path );
	}

	/**
	 * Perform an authenticated request.
	 *
	 * @param string $method HTTP method.
	 * @param string $path   Path starting with /api/...
	 * @return array|WP_Error
	 */
	private function request( $method, $path ) {
		$base = isset( $this->settings['cms_base_url'] ) ? untrailingslashit( trim( (string) $this->settings['cms_base_url'] ) ) : '';
		$key  = isset( $this->settings['api_key'] ) ? trim( (string) $this->settings['api_key'] ) : '';
		$site = isset( $this->settings['site_id'] ) ? trim( (string) $this->settings['site_id'] ) : '';

		if ( '' === $base || '' === $key || '' === $site ) {
			return new WP_Error(
				'witflow_cms_config',
				__( 'CMS base URL, Site ID, and API key are required.', 'witflow-cms' )
			);
		}

		$url  = $base . $path;
		$args = array(
			'method'  => $method,
			'timeout' => 30,
			'headers' => array(
				'Accept'        => 'application/json',
				'Authorization' => 'Bearer ' . $key,
				'x-api-key'     => $key,
			),
		);

		$response = wp_remote_request( $url, $args );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( $code < 200 || $code >= 300 ) {
			$message = is_array( $data ) && isset( $data['error'] ) ? (string) $data['error'] : $body;
			return new WP_Error(
				'witflow_cms_api_error',
				sprintf(
					/* translators: 1: HTTP status, 2: error message */
					__( 'CMS API error (%1$d): %2$s', 'witflow-cms' ),
					$code,
					$message ? $message : 'Unknown error'
				),
				array( 'status' => $code )
			);
		}

		if ( ! is_array( $data ) ) {
			return new WP_Error( 'witflow_cms_api_invalid', __( 'Invalid JSON from CMS API.', 'witflow-cms' ) );
		}

		return $data;
	}
}
