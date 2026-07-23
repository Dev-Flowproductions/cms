<?php
/**
 * Markdown to HTML conversion.
 *
 * @package Witflow_CMS
 */

defined( 'ABSPATH' ) || exit;

/**
 * Converts CMS markdown content to HTML for WordPress.
 */
class Witflow_CMS_Markdown {

	/**
	 * Convert markdown string to HTML.
	 *
	 * @param string $markdown Markdown content.
	 * @return string
	 */
	public static function to_html( $markdown ) {
		if ( ! is_string( $markdown ) || '' === trim( $markdown ) ) {
			return '';
		}

		static $parser = null;
		if ( null === $parser ) {
			$parser = new Parsedown();
			$parser->setSafeMode( true );
			$parser->setBreaksEnabled( true );
		}

		$html = $parser->text( $markdown );

		/**
		 * Filter HTML produced from CMS markdown.
		 *
		 * @param string $html     Converted HTML.
		 * @param string $markdown Source markdown.
		 */
		return apply_filters( 'witflow_cms_markdown_html', $html, $markdown );
	}
}
