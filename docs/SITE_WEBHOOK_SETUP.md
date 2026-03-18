# Connect your site to the CMS (webhook)

This guide explains what you need to do **on your website** so it can receive published posts from the CMS.

---

## 1. Create a webhook endpoint on your site

Your site must expose a **URL** that accepts `POST` requests from the CMS. Common patterns:

- `https://yourdomain.com/api/cms-webhook`
- `https://yourdomain.com/api/cms/revalidate`
- `https://yourdomain.com/api/revalidate`

This endpoint will be called whenever a post is **published**, **updated**, or **deleted** in the CMS.

---

## 2. What the CMS sends

- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `x-cms-event`: `post.published` | `post.updated` | `post.deleted`
  - `x-cms-timestamp`: ISO8601 timestamp
  - `x-cms-signature`: HMAC-SHA256 of the request body (hex), using your Webhook Secret
  - `x-webhook-secret`: (legacy) the raw Webhook Secret, if you configured one

- **Body:** JSON with full post data. Example shape:

```json
{
  "event": "post.published",
  "siteId": "client-uuid",
  "post": {
    "id": "post-uuid",
    "slug": "article-slug",
    "status": "published",
    "updatedAt": "2026-03-16T12:00:00Z",
    "cover_image_url": "https://...",
    "title": "...",
    "excerpt": "...",
    "content_md": "...",
    "seo_title": "...",
    "meta_description": "...",
    "json_ld": { ... },
    "locale": "pt",
    "translations": {
      "en": { "title": "...", "excerpt": "...", "content_md": "...", ... },
      "fr": { ... }
    }
  },
  "timestamp": "2026-03-16T12:00:05Z",
  "signatureVersion": "v1"
}
```

For `post.deleted`, the payload is minimal (event, siteId, post id/slug, timestamp).

---

## 3. What your endpoint must do

1. **Accept POST** and read the JSON body.
2. **(Recommended)** Verify the request is from the CMS:
   - Either check the **`x-webhook-secret`** header equals the secret you set in the CMS, or
   - Verify **`x-cms-signature`**: compute `HMAC-SHA256(utf8 body, webhook_secret)` and compare with the header (use constant-time comparison).
3. **Return a 2xx status** (e.g. `200` or `204`) so the CMS marks the delivery as successful. Any non-2xx response is stored as a failed webhook and shown in the CMS.
4. **Use the payload** to update your site: e.g. revalidate the blog index and the post page, or write the content to your database/static files.

---

## 4. Configure the webhook in the CMS

A CMS admin must set **your** site’s webhook details:

1. In **CMS Admin → Users**, open the user/client that represents your site.
2. In the **Webhook** section set:
   - **Webhook URL:** your endpoint (e.g. `https://yourdomain.com/api/cms-webhook`)
   - **Webhook Secret:** a shared secret (e.g. a long random string). Store the same value on your site (e.g. env `CMS_WEBHOOK_SECRET`) to verify requests.
3. Save. Optionally enable **Auto-publish** so new posts are pushed to your site when they are published.

After this, when a post is published (manually or via auto-publish), the CMS will `POST` to your URL with the payload above.

---

## 5. Quick checklist

| Step | Where | Action |
|------|--------|--------|
| 1 | Your site | Add a route that accepts `POST` and returns 2xx (e.g. `/api/cms-webhook`). |
| 2 | Your site | Read JSON body; optionally verify `x-webhook-secret` or `x-cms-signature`. |
| 3 | Your site | Revalidate or update the blog index and post page using the payload. |
| 4 | CMS Admin | Set **Webhook URL** and **Webhook Secret** for your client/user. |
| 5 | CMS | Publish a post (or use Auto-publish); confirm your endpoint is called and returns 2xx. |

---

## 6. Testing

- Use **CMS Admin** to set the webhook URL to a test endpoint (e.g. [webhook.site](https://webhook.site) or a local tunnel) and publish a post to inspect the payload.
- The CMS also exposes a test endpoint: `POST /api/test-webhook` (on the CMS host) — you can send a sample payload there to see the logging format; your **site** must still implement its own URL that the CMS will call.
