<?php
/**
 * Featured image sideload helpers.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Downloads remote cover images into the media library.
 */
class Witflow_CMS_Media {

	/**
	 * Ensure a featured image is set from a remote URL.
	 *
	 * Reuses an existing attachment when the same URL is already stored on the post.
	 *
	 * @param int         $post_id   WP post ID.
	 * @param string|null $image_url Remote image URL.
	 * @param string      $alt       Alt text.
	 * @return int|WP_Error Attachment ID or error.
	 */
	public static function set_featured_image( $post_id, $image_url, $alt = '' ) {
		$post_id = (int) $post_id;
		if ( $post_id <= 0 || ! is_string( $image_url ) || '' === trim( $image_url ) ) {
			return new WP_Error( 'witflow_cms_no_image', 'No cover image URL provided.' );
		}

		$image_url = esc_url_raw( $image_url );
		if ( ! $image_url ) {
			return new WP_Error( 'witflow_cms_bad_image_url', 'Invalid cover image URL.' );
		}

		$existing_url = get_post_meta( $post_id, '_witflow_cms_cover_url', true );
		$thumb_id     = (int) get_post_thumbnail_id( $post_id );
		if ( $thumb_id && $existing_url && $existing_url === $image_url ) {
			if ( $alt ) {
				update_post_meta( $thumb_id, '_wp_attachment_image_alt', sanitize_text_field( $alt ) );
			}
			return $thumb_id;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$tmp = download_url( $image_url, 30 );
		if ( is_wp_error( $tmp ) ) {
			return $tmp;
		}

		$path = wp_parse_url( $image_url, PHP_URL_PATH );
		$name = $path ? basename( $path ) : 'cover.jpg';
		$name = sanitize_file_name( $name );
		if ( ! $name ) {
			$name = 'cover.jpg';
		}

		$file_array = array(
			'name'     => $name,
			'tmp_name' => $tmp,
		);

		$attachment_id = media_handle_sideload( $file_array, $post_id );
		if ( is_wp_error( $attachment_id ) ) {
			@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			return $attachment_id;
		}

		set_post_thumbnail( $post_id, $attachment_id );
		update_post_meta( $post_id, '_witflow_cms_cover_url', $image_url );

		if ( $alt ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt ) );
		}

		return $attachment_id;
	}
}
