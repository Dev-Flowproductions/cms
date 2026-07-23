<?php
/**
 * Settings page and admin actions.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Settings → Witflow CMS
 */
class Witflow_CMS_Settings {

	/**
	 * Register submenu under Settings.
	 */
	public function register_menu() {
		add_options_page(
			__( 'Witflow CMS', 'witflow-cms' ),
			__( 'Witflow CMS', 'witflow-cms' ),
			'manage_options',
			'witflow-cms',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting(
			'witflow_cms_settings_group',
			WITFLOW_CMS_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Enqueue admin CSS on settings page.
	 *
	 * @param string $hook Hook suffix.
	 */
	public function enqueue_assets( $hook ) {
		if ( 'settings_page_witflow-cms' !== $hook ) {
			return;
		}
		wp_enqueue_style(
			'witflow-cms-admin',
			WITFLOW_CMS_URL . 'assets/admin.css',
			array(),
			WITFLOW_CMS_VERSION
		);
	}

	/**
	 * Sanitize settings array.
	 *
	 * @param array $input Raw input.
	 * @return array
	 */
	public function sanitize( $input ) {
		$current = Witflow_CMS_Plugin::get_settings();
		if ( ! is_array( $input ) ) {
			return $current;
		}

		$out = $current;

		if ( isset( $input['cms_base_url'] ) ) {
			$out['cms_base_url'] = esc_url_raw( trim( (string) $input['cms_base_url'] ) );
		}
		if ( isset( $input['site_id'] ) ) {
			$out['site_id'] = sanitize_text_field( trim( (string) $input['site_id'] ) );
		}
		if ( isset( $input['api_key'] ) ) {
			$out['api_key'] = sanitize_text_field( trim( (string) $input['api_key'] ) );
		}
		if ( isset( $input['webhook_secret'] ) ) {
			$out['webhook_secret'] = sanitize_text_field( trim( (string) $input['webhook_secret'] ) );
		}
		if ( isset( $input['default_locale'] ) ) {
			$locale = strtolower( sanitize_text_field( (string) $input['default_locale'] ) );
			$out['default_locale'] = in_array( $locale, array( 'pt', 'en', 'fr' ), true ) ? $locale : 'en';
		}
		if ( isset( $input['post_status'] ) ) {
			$status = sanitize_text_field( (string) $input['post_status'] );
			$out['post_status'] = in_array( $status, array( 'publish', 'draft', 'pending' ), true ) ? $status : 'publish';
		}
		if ( isset( $input['author_id'] ) ) {
			$out['author_id'] = absint( $input['author_id'] );
		}

		$map = isset( $input['locale_map'] ) && is_array( $input['locale_map'] ) ? $input['locale_map'] : array();
		$out['locale_map'] = array(
			'pt' => isset( $map['pt'] ) ? sanitize_title( (string) $map['pt'] ) : 'pt',
			'en' => isset( $map['en'] ) ? sanitize_title( (string) $map['en'] ) : 'en',
			'fr' => isset( $map['fr'] ) ? sanitize_title( (string) $map['fr'] ) : 'fr',
		);
		foreach ( array( 'pt', 'en', 'fr' ) as $loc ) {
			if ( '' === $out['locale_map'][ $loc ] ) {
				$out['locale_map'][ $loc ] = $loc;
			}
		}

		return $out;
	}

	/**
	 * Render settings page.
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$settings    = Witflow_CMS_Plugin::get_settings();
		$webhook_url = rest_url( 'witflow-cms/v1/webhook' );
		$users       = get_users(
			array(
				'who'    => 'authors',
				'fields' => array( 'ID', 'display_name' ),
			)
		);

		$notice  = isset( $_GET['witflow_notice'] ) ? sanitize_text_field( wp_unslash( $_GET['witflow_notice'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$message = isset( $_GET['witflow_message'] ) ? sanitize_text_field( wp_unslash( $_GET['witflow_message'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		?>
		<div class="wrap witflow-cms-settings">
			<h1><?php echo esc_html__( 'Witflow CMS', 'witflow-cms' ); ?></h1>

			<?php if ( $notice ) : ?>
				<div class="notice notice-<?php echo 'error' === $notice ? 'error' : 'success'; ?> is-dismissible">
					<p><?php echo esc_html( $message ? $message : $notice ); ?></p>
				</div>
			<?php endif; ?>

			<div class="witflow-cms-card">
				<h2><?php echo esc_html__( 'Webhook URL', 'witflow-cms' ); ?></h2>
				<p><?php echo esc_html__( 'Paste this URL into CMS Admin → Users → your client → Webhook URL.', 'witflow-cms' ); ?></p>
				<code class="witflow-cms-copy" id="witflow-webhook-url"><?php echo esc_html( $webhook_url ); ?></code>
				<button type="button" class="button" id="witflow-copy-webhook"><?php echo esc_html__( 'Copy', 'witflow-cms' ); ?></button>
			</div>

			<form method="post" action="options.php">
				<?php settings_fields( 'witflow_cms_settings_group' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="witflow_cms_base_url"><?php echo esc_html__( 'CMS base URL', 'witflow-cms' ); ?></label></th>
						<td>
							<input type="url" class="regular-text" id="witflow_cms_base_url" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[cms_base_url]" value="<?php echo esc_attr( $settings['cms_base_url'] ); ?>" placeholder="https://cms.example.com" />
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="witflow_site_id"><?php echo esc_html__( 'Site ID', 'witflow-cms' ); ?></label></th>
						<td>
							<input type="text" class="regular-text" id="witflow_site_id" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[site_id]" value="<?php echo esc_attr( $settings['site_id'] ); ?>" />
							<p class="description"><?php echo esc_html__( 'Client UUID from CMS Admin (Site ID).', 'witflow-cms' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="witflow_api_key"><?php echo esc_html__( 'API key', 'witflow-cms' ); ?></label></th>
						<td>
							<input type="password" class="regular-text" id="witflow_api_key" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[api_key]" value="<?php echo esc_attr( $settings['api_key'] ); ?>" autocomplete="off" />
							<p class="description"><?php echo esc_html__( 'CMS API key or the same value as the webhook secret.', 'witflow-cms' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="witflow_webhook_secret"><?php echo esc_html__( 'Webhook secret', 'witflow-cms' ); ?></label></th>
						<td>
							<input type="password" class="regular-text" id="witflow_webhook_secret" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[webhook_secret]" value="<?php echo esc_attr( $settings['webhook_secret'] ); ?>" autocomplete="off" />
							<p class="description"><?php echo esc_html__( 'Must match the Webhook Secret in CMS Admin character for character.', 'witflow-cms' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="witflow_default_locale"><?php echo esc_html__( 'Default locale', 'witflow-cms' ); ?></label></th>
						<td>
							<select id="witflow_default_locale" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[default_locale]">
								<?php foreach ( array( 'pt', 'en', 'fr' ) as $loc ) : ?>
									<option value="<?php echo esc_attr( $loc ); ?>" <?php selected( $settings['default_locale'], $loc ); ?>><?php echo esc_html( strtoupper( $loc ) ); ?></option>
								<?php endforeach; ?>
							</select>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="witflow_post_status"><?php echo esc_html__( 'Post status', 'witflow-cms' ); ?></label></th>
						<td>
							<select id="witflow_post_status" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[post_status]">
								<option value="publish" <?php selected( $settings['post_status'], 'publish' ); ?>><?php echo esc_html__( 'Publish', 'witflow-cms' ); ?></option>
								<option value="draft" <?php selected( $settings['post_status'], 'draft' ); ?>><?php echo esc_html__( 'Draft', 'witflow-cms' ); ?></option>
								<option value="pending" <?php selected( $settings['post_status'], 'pending' ); ?>><?php echo esc_html__( 'Pending', 'witflow-cms' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="witflow_author_id"><?php echo esc_html__( 'Default author', 'witflow-cms' ); ?></label></th>
						<td>
							<select id="witflow_author_id" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[author_id]">
								<option value="0"><?php echo esc_html__( '— Automatic —', 'witflow-cms' ); ?></option>
								<?php foreach ( $users as $user ) : ?>
									<option value="<?php echo esc_attr( $user->ID ); ?>" <?php selected( (int) $settings['author_id'], (int) $user->ID ); ?>><?php echo esc_html( $user->display_name ); ?></option>
								<?php endforeach; ?>
							</select>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php echo esc_html__( 'Polylang language map', 'witflow-cms' ); ?></th>
						<td>
							<p class="description"><?php echo esc_html__( 'Map CMS locales to Polylang language slugs (e.g. pt → pt-pt).', 'witflow-cms' ); ?></p>
							<?php foreach ( array( 'pt', 'en', 'fr' ) as $loc ) : ?>
								<label>
									<?php echo esc_html( strtoupper( $loc ) ); ?> →
									<input type="text" class="small-text" name="<?php echo esc_attr( WITFLOW_CMS_OPTION ); ?>[locale_map][<?php echo esc_attr( $loc ); ?>]" value="<?php echo esc_attr( $settings['locale_map'][ $loc ] ); ?>" />
								</label>
								<br />
							<?php endforeach; ?>
						</td>
					</tr>
				</table>
				<?php submit_button( __( 'Save settings', 'witflow-cms' ) ); ?>
			</form>

			<hr />

			<div class="witflow-cms-actions">
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block;margin-right:8px;">
					<input type="hidden" name="action" value="witflow_cms_test_connection" />
					<?php wp_nonce_field( 'witflow_cms_test_connection' ); ?>
					<?php submit_button( __( 'Test connection', 'witflow-cms' ), 'secondary', 'submit', false ); ?>
				</form>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline-block;">
					<input type="hidden" name="action" value="witflow_cms_sync_now" />
					<?php wp_nonce_field( 'witflow_cms_sync_now' ); ?>
					<?php submit_button( __( 'Sync now', 'witflow-cms' ), 'secondary', 'submit', false ); ?>
				</form>
			</div>
		</div>
		<script>
		(function () {
			var btn = document.getElementById('witflow-copy-webhook');
			var el = document.getElementById('witflow-webhook-url');
			if (!btn || !el) return;
			btn.addEventListener('click', function () {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(el.textContent.trim());
				}
			});
		})();
		</script>
		<?php
	}

	/**
	 * Admin-post: test CMS API connection.
	 */
	public function handle_test_connection() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Forbidden', 'witflow-cms' ) );
		}
		check_admin_referer( 'witflow_cms_test_connection' );

		$client = new Witflow_CMS_API_Client();
		$result = $client->test_connection();

		if ( is_wp_error( $result ) ) {
			$this->redirect_notice( 'error', $result->get_error_message() );
		}

		$count = isset( $result['posts'] ) && is_array( $result['posts'] ) ? count( $result['posts'] ) : 0;
		$this->redirect_notice(
			'success',
			sprintf(
				/* translators: %d: number of posts returned */
				__( 'Connection OK. CMS returned %d post(s) on page 1.', 'witflow-cms' ),
				$count
			)
		);
	}

	/**
	 * Admin-post: pull and upsert all published posts.
	 */
	public function handle_sync_now() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Forbidden', 'witflow-cms' ) );
		}
		check_admin_referer( 'witflow_cms_sync_now' );

		$sync   = new Witflow_CMS_Post_Sync();
		$result = $sync->sync_all_from_api();

		if ( is_wp_error( $result ) ) {
			$this->redirect_notice( 'error', $result->get_error_message() );
		}

		$msg = sprintf(
			/* translators: %d: upserted count */
			__( 'Sync complete. Upserted %d post(s).', 'witflow-cms' ),
			isset( $result['upserted'] ) ? (int) $result['upserted'] : 0
		);
		if ( ! empty( $result['errors'] ) ) {
			$msg .= ' ' . sprintf(
				/* translators: %d: error count */
				__( '%d error(s).', 'witflow-cms' ),
				count( $result['errors'] )
			);
		}
		$this->redirect_notice( 'success', $msg );
	}

	/**
	 * Redirect back to settings with a notice.
	 *
	 * @param string $type success|error.
	 * @param string $message Message.
	 */
	private function redirect_notice( $type, $message ) {
		$url = add_query_arg(
			array(
				'page'            => 'witflow-cms',
				'witflow_notice'  => $type,
				'witflow_message' => $message,
			),
			admin_url( 'options-general.php' )
		);
		wp_safe_redirect( $url );
		exit;
	}
}
