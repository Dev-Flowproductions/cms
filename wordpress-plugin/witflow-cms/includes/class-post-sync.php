<?php
/**
 * Upsert and delete WordPress posts from CMS payloads.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Syncs CMS posts into native WordPress posts.
 */
class Witflow_CMS_Post_Sync {

	const META_POST_ID = '_witflow_cms_post_id';
	const META_LOCALE  = '_witflow_cms_locale';
	const META_SLUG    = '_witflow_cms_slug';

	/**
	 * Handle a webhook payload (publish/update/delete).
	 *
	 * @param array $payload Decoded JSON body.
	 * @return array|WP_Error Result data or error.
	 */
	public function handle_payload( array $payload ) {
		$event = isset( $payload['event'] ) ? (string) $payload['event'] : '';
		$post  = isset( $payload['post'] ) && is_array( $payload['post'] ) ? $payload['post'] : null;

		if ( ! $post || empty( $post['id'] ) ) {
			return new WP_Error( 'witflow_cms_bad_payload', __( 'Missing post data in webhook payload.', 'witflow-cms' ), array( 'status' => 400 ) );
		}

		$cms_id = (string) $post['id'];

		if ( $this->is_delete_event( $event ) ) {
			$trashed = $this->trash_by_cms_id( $cms_id );
			return array(
				'ok'      => true,
				'action'  => 'deleted',
				'cmsId'   => $cms_id,
				'trashed' => $trashed,
			);
		}

		if ( ! $this->is_upsert_event( $event ) && '' !== $event ) {
			return new WP_Error(
				'witflow_cms_unknown_event',
				sprintf(
					/* translators: %s: event name */
					__( 'Unsupported webhook event: %s', 'witflow-cms' ),
					$event
				),
				array( 'status' => 400 )
			);
		}

		return $this->upsert_from_webhook_post( $post );
	}

	/**
	 * Upsert from webhook post object (full content in payload).
	 *
	 * @param array $post Webhook post object.
	 * @return array|WP_Error
	 */
	public function upsert_from_webhook_post( array $post ) {
		$cms_id = (string) $post['id'];
		$slug   = isset( $post['slug'] ) ? sanitize_title( (string) $post['slug'] ) : '';
		if ( '' === $slug ) {
			return new WP_Error( 'witflow_cms_no_slug', __( 'Post slug is required.', 'witflow-cms' ), array( 'status' => 400 ) );
		}

		$locales = $this->extract_locale_contents( $post );
		if ( empty( $locales ) ) {
			return new WP_Error( 'witflow_cms_no_locales', __( 'No localizations found in payload.', 'witflow-cms' ), array( 'status' => 400 ) );
		}

		if ( count( $locales ) > 1 && ! Witflow_CMS_I18n::polylang_active() ) {
			return new WP_Error(
				'witflow_cms_polylang_required',
				__( 'Polylang is required to sync multiple locales (pt/en/fr). Install and activate Polylang, then retry publish.', 'witflow-cms' ),
				array( 'status' => 503 )
			);
		}

		$cover_url = isset( $post['cover_image_url'] ) ? $post['cover_image_url'] : null;
		$cover_alt = '';
		if ( isset( $post['cover_image_alt'] ) ) {
			$cover_alt = (string) $post['cover_image_alt'];
		}

		$ids_by_locale = array();
		foreach ( $locales as $locale => $content ) {
			$result = $this->upsert_locale_post(
				$cms_id,
				$slug,
				$locale,
				$content,
				$cover_url,
				$cover_alt
			);
			if ( is_wp_error( $result ) ) {
				return $result;
			}
			$ids_by_locale[ $locale ] = $result;
		}

		$linked = Witflow_CMS_I18n::link_translations( $ids_by_locale );
		if ( is_wp_error( $linked ) ) {
			return $linked;
		}

		return array(
			'ok'      => true,
			'action'  => 'upserted',
			'cmsId'   => $cms_id,
			'slug'    => $slug,
			'postIds' => $ids_by_locale,
		);
	}

	/**
	 * Upsert from Content API post response (camelCase fields).
	 *
	 * @param array $api_post API post object.
	 * @return array|WP_Error
	 */
	public function upsert_from_api_post( array $api_post ) {
		$webhook_shaped = $this->api_post_to_webhook_shape( $api_post );
		return $this->upsert_from_webhook_post( $webhook_shaped );
	}

	/**
	 * Sync all published posts via pull API (paginated).
	 *
	 * @param int $max_pages Safety cap.
	 * @return array|WP_Error Summary.
	 */
	public function sync_all_from_api( $max_pages = 50 ) {
		$client   = new Witflow_CMS_API_Client();
		$page     = 1;
		$upserted = 0;
		$errors   = array();

		while ( $page <= $max_pages ) {
			$list = $client->list_posts( $page, 50 );
			if ( is_wp_error( $list ) ) {
				return $list;
			}

			$posts = isset( $list['posts'] ) && is_array( $list['posts'] ) ? $list['posts'] : array();
			if ( empty( $posts ) ) {
				break;
			}

			foreach ( $posts as $summary ) {
				$slug = isset( $summary['slug'] ) ? (string) $summary['slug'] : '';
				if ( '' === $slug ) {
					continue;
				}
				$full = $client->get_post( $slug );
				if ( is_wp_error( $full ) ) {
					$errors[] = $slug . ': ' . $full->get_error_message();
					continue;
				}
				$result = $this->upsert_from_api_post( $full );
				if ( is_wp_error( $result ) ) {
					$errors[] = $slug . ': ' . $result->get_error_message();
					continue;
				}
				++$upserted;
			}

			$pagination = isset( $list['pagination'] ) && is_array( $list['pagination'] ) ? $list['pagination'] : array();
			$total_pages = isset( $pagination['totalPages'] ) ? (int) $pagination['totalPages'] : $page;
			if ( $page >= $total_pages ) {
				break;
			}
			++$page;
		}

		return array(
			'ok'       => true,
			'upserted' => $upserted,
			'errors'   => $errors,
			'pages'    => $page,
		);
	}

	/**
	 * Trash all WP posts linked to a CMS post id.
	 *
	 * @param string $cms_id CMS post UUID.
	 * @return int[] Trashed WP post IDs.
	 */
	public function trash_by_cms_id( $cms_id ) {
		$ids     = $this->find_posts_by_cms_id( $cms_id );
		$trashed = array();
		foreach ( $ids as $post_id ) {
			$result = wp_trash_post( $post_id );
			if ( $result ) {
				$trashed[] = $post_id;
			}
		}
		return $trashed;
	}

	/**
	 * Create or update one locale post.
	 *
	 * @param string      $cms_id    CMS post id.
	 * @param string      $slug      Shared slug.
	 * @param string      $locale    CMS locale.
	 * @param array       $content   Locale content fields.
	 * @param string|null $cover_url Cover image URL.
	 * @param string      $cover_alt Cover alt text.
	 * @return int|WP_Error WP post ID.
	 */
	private function upsert_locale_post( $cms_id, $slug, $locale, array $content, $cover_url, $cover_alt ) {
		$settings    = Witflow_CMS_Plugin::get_settings();
		$post_status = isset( $settings['post_status'] ) ? (string) $settings['post_status'] : 'publish';
		if ( ! in_array( $post_status, array( 'publish', 'draft', 'pending' ), true ) ) {
			$post_status = 'publish';
		}

		$author_id = isset( $settings['author_id'] ) ? (int) $settings['author_id'] : 0;
		if ( $author_id <= 0 ) {
			$author_id = (int) get_current_user_id();
		}
		if ( $author_id <= 0 ) {
			$admins = get_users(
				array(
					'role'   => 'administrator',
					'number' => 1,
					'fields' => 'ID',
				)
			);
			$author_id = ! empty( $admins ) ? (int) $admins[0] : 1;
		}

		$title   = isset( $content['title'] ) ? wp_strip_all_tags( (string) $content['title'] ) : $slug;
		$excerpt = isset( $content['excerpt'] ) ? (string) $content['excerpt'] : '';
		$md      = isset( $content['content_md'] ) ? (string) $content['content_md'] : '';
		$html    = Witflow_CMS_Markdown::to_html( $md );

		$existing_id = $this->find_post_by_cms_id_locale( $cms_id, $locale );
		$postarr     = array(
			'post_title'   => $title,
			'post_name'    => $slug,
			'post_excerpt' => wp_strip_all_tags( $excerpt ),
			'post_content' => $html,
			'post_status'  => $post_status,
			'post_type'    => 'post',
			'post_author'  => $author_id,
		);

		if ( $existing_id ) {
			$postarr['ID'] = $existing_id;
			// Avoid unique slug collisions across languages — Polylang handles language URLs.
			$post_id = wp_update_post( $postarr, true );
		} else {
			$post_id = wp_insert_post( $postarr, true );
		}

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}
		$post_id = (int) $post_id;

		update_post_meta( $post_id, self::META_POST_ID, $cms_id );
		update_post_meta( $post_id, self::META_LOCALE, $locale );
		update_post_meta( $post_id, self::META_SLUG, $slug );

		Witflow_CMS_SEO::apply(
			$post_id,
			array(
				'seo_title'        => isset( $content['seo_title'] ) ? $content['seo_title'] : '',
				'meta_description' => isset( $content['meta_description'] ) ? $content['meta_description'] : '',
				'json_ld'          => isset( $content['json_ld'] ) ? $content['json_ld'] : null,
			)
		);

		if ( $cover_url ) {
			Witflow_CMS_Media::set_featured_image( $post_id, $cover_url, $cover_alt );
		}

		return $post_id;
	}

	/**
	 * Build locale => content map from webhook post.
	 *
	 * @param array $post Webhook post.
	 * @return array
	 */
	private function extract_locale_contents( array $post ) {
		$locales = array();
		$translations = isset( $post['translations'] ) && is_array( $post['translations'] ) ? $post['translations'] : array();

		foreach ( $translations as $locale => $data ) {
			if ( ! is_array( $data ) ) {
				continue;
			}
			$locale = strtolower( (string) $locale );
			if ( ! in_array( $locale, Witflow_CMS_I18n::supported_locales(), true ) ) {
				continue;
			}
			$locales[ $locale ] = array(
				'title'            => isset( $data['title'] ) ? $data['title'] : '',
				'excerpt'          => isset( $data['excerpt'] ) ? $data['excerpt'] : '',
				'content_md'       => isset( $data['content_md'] ) ? $data['content_md'] : '',
				'seo_title'        => isset( $data['seo_title'] ) ? $data['seo_title'] : '',
				'meta_description' => isset( $data['meta_description'] ) ? $data['meta_description'] : '',
				'json_ld'          => isset( $data['json_ld'] ) ? $data['json_ld'] : null,
			);
		}

		if ( empty( $locales ) ) {
			$settings = Witflow_CMS_Plugin::get_settings();
			$fallback = isset( $post['locale'] ) ? strtolower( (string) $post['locale'] ) : (string) $settings['default_locale'];
			if ( ! in_array( $fallback, Witflow_CMS_I18n::supported_locales(), true ) ) {
				$fallback = 'en';
			}
			$locales[ $fallback ] = array(
				'title'            => isset( $post['title'] ) ? $post['title'] : '',
				'excerpt'          => isset( $post['excerpt'] ) ? $post['excerpt'] : '',
				'content_md'       => isset( $post['content_md'] ) ? $post['content_md'] : '',
				'seo_title'        => isset( $post['seo_title'] ) ? $post['seo_title'] : '',
				'meta_description' => isset( $post['meta_description'] ) ? $post['meta_description'] : '',
				'json_ld'          => isset( $post['json_ld'] ) ? $post['json_ld'] : null,
			);
		}

		return $locales;
	}

	/**
	 * Convert API (camelCase) post to webhook-shaped post.
	 *
	 * @param array $api API post.
	 * @return array
	 */
	private function api_post_to_webhook_shape( array $api ) {
		$translations_out = array();
		$api_translations = isset( $api['translations'] ) && is_array( $api['translations'] ) ? $api['translations'] : array();

		foreach ( $api_translations as $locale => $data ) {
			if ( ! is_array( $data ) ) {
				continue;
			}
			$translations_out[ $locale ] = array(
				'title'            => isset( $data['title'] ) ? $data['title'] : '',
				'excerpt'          => isset( $data['excerpt'] ) ? $data['excerpt'] : '',
				'content_md'       => isset( $data['content'] ) ? $data['content'] : ( isset( $data['content_md'] ) ? $data['content_md'] : '' ),
				'seo_title'        => isset( $data['seoTitle'] ) ? $data['seoTitle'] : ( isset( $data['seo_title'] ) ? $data['seo_title'] : '' ),
				'meta_description' => isset( $data['seoDescription'] ) ? $data['seoDescription'] : ( isset( $data['meta_description'] ) ? $data['meta_description'] : '' ),
				'json_ld'          => isset( $data['structuredData'] ) ? $data['structuredData'] : ( isset( $data['json_ld'] ) ? $data['json_ld'] : null ),
			);
		}

		// Top-level content fills primary locale when translations lack full body.
		$primary_locale = isset( $api['locale'] ) ? (string) $api['locale'] : 'en';
		if ( ! isset( $translations_out[ $primary_locale ] ) ) {
			$translations_out[ $primary_locale ] = array();
		}
		$primary = &$translations_out[ $primary_locale ];
		if ( empty( $primary['content_md'] ) && isset( $api['content'] ) ) {
			$primary['content_md'] = $api['content'];
		}
		if ( empty( $primary['title'] ) && isset( $api['title'] ) ) {
			$primary['title'] = $api['title'];
		}
		if ( empty( $primary['excerpt'] ) && isset( $api['excerpt'] ) ) {
			$primary['excerpt'] = $api['excerpt'];
		}
		if ( empty( $primary['seo_title'] ) && isset( $api['seoTitle'] ) ) {
			$primary['seo_title'] = $api['seoTitle'];
		}
		if ( empty( $primary['meta_description'] ) && isset( $api['seoDescription'] ) ) {
			$primary['meta_description'] = $api['seoDescription'];
		}
		if ( empty( $primary['json_ld'] ) && isset( $api['structuredData'] ) ) {
			$primary['json_ld'] = $api['structuredData'];
		}

		return array(
			'id'              => isset( $api['id'] ) ? $api['id'] : '',
			'slug'            => isset( $api['slug'] ) ? $api['slug'] : '',
			'locale'          => $primary_locale,
			'cover_image_url' => isset( $api['coverImageUrl'] ) ? $api['coverImageUrl'] : null,
			'cover_image_alt' => isset( $api['coverImageAlt'] ) ? $api['coverImageAlt'] : '',
			'title'           => isset( $api['title'] ) ? $api['title'] : '',
			'excerpt'         => isset( $api['excerpt'] ) ? $api['excerpt'] : '',
			'content_md'      => isset( $api['content'] ) ? $api['content'] : '',
			'seo_title'       => isset( $api['seoTitle'] ) ? $api['seoTitle'] : '',
			'meta_description'=> isset( $api['seoDescription'] ) ? $api['seoDescription'] : '',
			'json_ld'         => isset( $api['structuredData'] ) ? $api['structuredData'] : null,
			'translations'    => $translations_out,
		);
	}

	/**
	 * @param string $event Event name.
	 * @return bool
	 */
	private function is_delete_event( $event ) {
		return in_array(
			$event,
			array( 'post.deleted', 'post.unpublished', 'cms.post.deleted' ),
			true
		);
	}

	/**
	 * @param string $event Event name.
	 * @return bool
	 */
	private function is_upsert_event( $event ) {
		return in_array(
			$event,
			array( 'post.published', 'post.updated', 'cms.post.published', 'cms.post.updated' ),
			true
		);
	}

	/**
	 * Find WP post by CMS id + locale.
	 *
	 * @param string $cms_id CMS id.
	 * @param string $locale Locale.
	 * @return int 0 if not found.
	 */
	private function find_post_by_cms_id_locale( $cms_id, $locale ) {
		$query = new WP_Query(
			array(
				'post_type'              => 'post',
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => 1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_query'             => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					'relation' => 'AND',
					array(
						'key'   => self::META_POST_ID,
						'value' => $cms_id,
					),
					array(
						'key'   => self::META_LOCALE,
						'value' => $locale,
					),
				),
			)
		);
		return ! empty( $query->posts ) ? (int) $query->posts[0] : 0;
	}

	/**
	 * Find all WP posts for a CMS id.
	 *
	 * @param string $cms_id CMS id.
	 * @return int[]
	 */
	private function find_posts_by_cms_id( $cms_id ) {
		$query = new WP_Query(
			array(
				'post_type'              => 'post',
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => 20,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'meta_query'             => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
					array(
						'key'   => self::META_POST_ID,
						'value' => $cms_id,
					),
				),
			)
		);
		return array_map( 'intval', $query->posts );
	}
}
