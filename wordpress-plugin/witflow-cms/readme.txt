=== Witflow CMS ===
Contributors: witflow
Tags: cms, webhook, headless, polylang, multilingual
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect WordPress to Witflow CMS. Receive published posts via webhook and sync pt/en/fr with Polylang.

== Description ==

Witflow CMS remains the source of truth for blog content. This plugin turns your WordPress site into the presentation layer:

* Receives `post.published` / `post.updated` / `post.deleted` webhooks from the CMS
* Verifies `x-cms-signature` (HMAC-SHA256) or `x-webhook-secret`
* Upserts native WordPress posts (Markdown → HTML, featured image sideload, SEO meta)
* Creates linked translations for **pt / en / fr** via [Polylang](https://wordpress.org/plugins/polylang/)
* Optional pull sync via the CMS Content API (`Test connection` / `Sync now`)

== Installation ==

1. Copy the `witflow-cms` folder to `wp-content/plugins/` (or zip the folder and upload via Plugins → Add New).
2. Activate **Witflow CMS**.
3. For multi-locale sites, install and activate **Polylang**, and add languages matching your map (default: `pt`, `en`, `fr`).
4. Go to **Settings → Witflow CMS** and fill in:
   * CMS base URL
   * Site ID (client UUID from CMS Admin)
   * API key (CMS API key or webhook secret)
   * Webhook secret (must match CMS Admin)
5. Copy the **Webhook URL** shown on that page.
6. In **CMS Admin → Users → your client**, set Webhook URL + Webhook Secret (event format: `spec`).
7. Publish a test post from the CMS (**Publish to website**). Confirm WordPress posts appear in each locale.

== Webhook ==

Endpoint: `POST /wp-json/witflow-cms/v1/webhook`

Auth (either is enough):

* Header `x-webhook-secret: <secret>`
* Header `x-cms-signature: <hmac-sha256-hex of raw body>`

Quick checks:

```
curl -i -X POST "https://yoursite.com/wp-json/witflow-cms/v1/webhook" -H "Content-Type: application/json" -d "{}"
# expect 401

curl -i -X POST "https://yoursite.com/wp-json/witflow-cms/v1/webhook" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d "{}"
# expect 400 (auth OK, payload incomplete) or 200 after a real CMS publish
```

== Multilingual ==

* Single-locale payloads work without Polylang.
* Multi-locale payloads (`translations` with pt/en/fr) require Polylang. The webhook returns **503** with a clear error if Polylang is missing, so CMS `webhook_status` shows a useful failure.
* Use **Polylang language map** in settings if your Polylang slugs differ (e.g. `pt` → `pt-pt`).

== SEO ==

* Writes Yoast (`_yoast_wpseo_*`) and Rank Math meta when those plugins are active.
* Otherwise stores `_witflow_cms_*` meta and prints JSON-LD from the CMS when no SEO plugin is present.

== Manual checklist ==

1. Invalid / missing signature → **401**
2. Valid publish with 3 locales + Polylang → three linked posts
3. Delete / unpublish webhook → posts trashed
4. **Test connection** → success against CMS API
5. **Sync now** → pulls published posts and upserts

== Changelog ==

= 1.0.0 =
* Initial release: webhook upsert/delete, Polylang pt/en/fr, pull API sync, Yoast/Rank Math SEO meta.
