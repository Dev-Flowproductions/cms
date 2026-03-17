# CMS Content API v1 — Headless blog integration

Base URL: `/api/v1`

Authentication: server-to-server only. Send either:

- `Authorization: Bearer <CMS_API_KEY>`
- `x-api-key: <CMS_API_KEY>`

The API key is scoped to one site (client). Use the site’s **Client ID** (UUID) as `siteId` in paths. You can use the client’s **CMS API Key** or **Webhook Secret** as the key (both are valid).

---

## Endpoints

### List published posts

`GET /api/v1/sites/{siteId}/posts`

Query params:

| Param   | Type   | Default | Description        |
|--------|--------|--------|--------------------|
| status | string | -      | Must be `published` |
| page   | number | 1      | Page number        |
| limit  | number | 20     | Items per page (max 100) |

Response:

```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "coverImageUrl": "string | null",
      "coverImageAlt": "string",
      "publishedAt": "ISO8601 | null",
      "updatedAt": "ISO8601",
      "author": { "id", "name", "slug", "bio", "avatarUrl" },
      "categories": [],
      "seoTitle": "string | null"
    }
  ],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

---

### Get post by slug

`GET /api/v1/sites/{siteId}/posts/{slug}`

Returns full post including `content`, `seoDescription`, `canonicalUrl`, `ogImageUrl`, `structuredData`, `locale`, and `translations` (keyed by locale).

---

### Get categories

`GET /api/v1/sites/{siteId}/categories`

Returns `[]` (categories not used in phase 1).

---

### Get authors

`GET /api/v1/sites/{siteId}/authors`

Returns array of authors with published posts: `{ id, name, slug, bio, avatarUrl }`.

---

### Get sitemap entries

`GET /api/v1/sites/{siteId}/sitemap`

Response:

```json
{
  "urls": [
    { "slug": "string", "updatedAt": "ISO8601", "publishedAt": "ISO8601 | null" }
  ]
}
```

---

## Webhook (CMS → website)

When a post is published, updated, or deleted, the CMS sends a `POST` request to the site’s **Webhook URL** with a signed payload.

### Headers

| Header           | Description                          |
|------------------|--------------------------------------|
| Content-Type     | application/json                     |
| x-cms-event      | `post.published` \| `post.updated` \| `post.deleted` |
| x-cms-timestamp  | ISO8601 timestamp                    |
| x-cms-signature  | HMAC-SHA256 of body (hex), using Webhook Secret |
| x-webhook-secret | (Legacy) raw secret for backward compatibility |

### Signature verification

1. Read body as UTF-8 string.
2. Compute `HMAC-SHA256(body, webhook_secret)` and encode as hex.
3. Compare with `x-cms-signature` (constant-time).
4. Optionally reject if `x-cms-timestamp` is too old (e.g. > 5 minutes).

### Payload (spec revalidation fields)

```json
{
  "event": "post.published",
  "siteId": "client-uuid",
  "post": {
    "id": "post-uuid",
    "slug": "article-slug",
    "status": "published",
    "updatedAt": "2026-03-16T12:00:00Z"
  },
  "timestamp": "2026-03-16T12:00:05Z",
  "signatureVersion": "v1"
}
```

For `post.published` and `post.updated`, the same request also includes full post content (e.g. `post.content_md`, `post.translations`, etc.) so the website can either revalidate by slug or ingest the payload. For `post.deleted`, only the spec fields plus `action: "delete"` and `slug` are sent.

### Events

- **post.published** — First time the post is pushed to the webhook.
- **post.updated** — Post was already published and is pushed again (content or metadata change).
- **post.deleted** — Post was published and has been deleted in the CMS.

---

## Website setup (Next.js)

1. In CMS Admin, get the **Client ID** (siteId) and set **Webhook URL** (e.g. `https://yoursite.com/api/cms/revalidate`) and **Webhook Secret**.
2. Optionally set **CMS API Key** (or use Webhook Secret for API auth).
3. Environment variables on the website:
   - `CMS_API_BASE_URL` — e.g. `https://cms.example.com`
   - `CMS_SITE_ID` — Client UUID
   - `CMS_API_KEY` — API key or webhook secret
   - `CMS_WEBHOOK_SECRET` — Same as Webhook Secret (for verifying webhooks)
4. Implement `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` that fetch from `GET /api/v1/sites/{CMS_SITE_ID}/posts` and `.../posts/{slug}`.
5. Implement `POST /api/cms/revalidate` that verifies `x-cms-signature` and revalidates `/blog` and `/blog/[slug]`.
