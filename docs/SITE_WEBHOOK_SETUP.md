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
    "author": {
      "name": "...",
      "jobTitle": "...",
      "bio": "...",
      "avatarUrl": "https://..."
    },
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

### Author byline vs profile

- **`post.author`** is the structured byline (name, job title, bio, avatar). **Prefer rendering the article author from this object**, not from HTML inside `content_md` — the CMS strips embedded author blocks from `content_md` in webhook payloads so your site always shows current data.
- **Source of truth:** If the account uses **Blog authors** (byline personas), values come from that persona. Otherwise they come from the **account profile**. Editing only the profile does **not** update posts that use a specific blog-author persona; update the persona under **Dashboard → Blog authors** (or adjust which author is selected for new generated posts).

---

## 3. What your endpoint must do

1. **Accept POST** and read the JSON body.
2. **(Recommended)** Verify the request is from the CMS:
   - Either check the **`x-webhook-secret`** header equals the secret you set in the CMS, or
   - Verify **`x-cms-signature`**: compute `HMAC-SHA256(utf8 body, webhook_secret)` and compare with the header (use constant-time comparison).
3. **Return a 2xx status** (e.g. `200` or `204`) so the CMS marks the delivery as successful. Any non-2xx response is stored as a failed webhook and shown in the CMS.
4. **Use the payload** to update your site: e.g. revalidate the blog index and the post page, or write the content to your database/static files.

---

## 4. Pre-flight checklist (before registering the webhook)

Before you register the webhook URL in CMS Admin, confirm:

1. **Webhook endpoint is live and returns 401 (not 404).**  
   The route `/api/cms-webhook` (or your equivalent) must already be deployed. Check with:  
   `curl -X POST https://yourdomain.com/api/cms-webhook`  
   You should get **401 Unauthorized** (missing or wrong secret), **not** **404 Not Found**. If you get 404, the deployment has not included the webhook route yet (e.g. if Vercel’s git-triggered deployment was blocked by plan restrictions, deploy manually with `npx vercel deploy --prod`).

2. **`cover_image_url` is a full absolute HTTPS URL** pointing to a publicly accessible resource (your CMS image CDN or storage).

3. **Next.js: allow external images.**  
   Next.js blocks remote images by default. Any Next.js site using the CMS must either add a wildcard `remotePatterns` entry or explicitly add the CMS image CDN hostname in `next.config.ts`. Otherwise cover images will render broken even when the URL is valid. See [§5.1 Next.js: allowing external cover images](#51-nextjs-allowing-external-cover-images) below.

---

## 5. Configure the webhook in the CMS

A CMS admin must set **your** site’s webhook details:

1. In **CMS Admin → Users**, open the user/client that represents your site.
2. In the **Webhook** section set:
   - **Webhook URL:** your endpoint (e.g. `https://yourdomain.com/api/cms-webhook`)
   - **Webhook Secret:** a shared secret (e.g. a long random string). Store the same value on your site (e.g. env `CMS_WEBHOOK_SECRET`) to verify requests.
3. Save. Optionally enable **Auto-publish** so new posts are pushed to your site when they are published.

After this, when a post is published (manually or via auto-publish), the CMS will `POST` to your URL with the payload above.

### 5.1 Next.js: allowing external cover images

Next.js requires you to explicitly whitelist the domains from which `<Image>` components can load remote URLs. Until a domain (or a wildcard pattern) is declared in `next.config.ts` under `images.remotePatterns`, any external image URL will render as broken — even if the URL is valid and publicly accessible.

Any Next.js site using the CMS must either:

- Add a wildcard pattern (e.g. allow all HTTPS origins), or  
- Explicitly add the CMS image CDN hostname to `next.config.ts`

before deploying. Example (wildcard):

```ts
// next.config.ts
export default {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
  },
}
```

Or list the CMS image host explicitly:

```ts
remotePatterns: [
  { protocol: 'https', hostname: 'your-cms-cdn.example.com', pathname: '/**' },
],
```

### 5.2 Verify the webhook endpoint before registering

After you deploy your site, **verify the webhook URL is reachable** before testing from the CMS. From a terminal:

```bash
curl -X POST https://yourdomain.com/api/cms-webhook
```

- **401 Unauthorized** — correct. The route exists and is rejecting the request (no/invalid secret).
- **404 Not Found** — the route is not deployed yet. Ensure the deployment included the webhook route (e.g. deploy manually with `npx vercel deploy --prod` if git-triggered deploys are blocked).

---

## 6. Quick checklist

**Before registering in CMS Admin:** complete the [Pre-flight checklist (§4)](#4-pre-flight-checklist-before-registering-the-webhook) (endpoint returns 401, `cover_image_url` is HTTPS, Next.js `remotePatterns` if applicable).

| Step | Where | Action |
|------|--------|--------|
| 1 | Your site | Add a route that accepts `POST` and returns 2xx (e.g. `/api/cms-webhook`). |
| 2 | Your site | Read JSON body; optionally verify `x-webhook-secret` or `x-cms-signature`. |
| 3 | Your site | Revalidate or update the blog index and post page using the payload. |
| 4 | CMS Admin | Set **Webhook URL** and **Webhook Secret** for your client/user. |
| 5 | CMS | Publish a post (or use Auto-publish); confirm your endpoint is called and returns 2xx. |

---

## 7. Testing

- Use **CMS Admin** to set the webhook URL to a test endpoint (e.g. [webhook.site](https://webhook.site) or a local tunnel) and publish a post to inspect the payload.
- The CMS also exposes a test endpoint: `POST /api/test-webhook` (on the CMS host) — you can send a sample payload there to see the logging format; your **site** must still implement its own URL that the CMS will call.
