# Connect your site to the CMS (webhook)

This guide is for **your website team**. It explains how to receive published posts from Witflow CMS, verify requests, and avoid the connection issues we see most often in production (401 auth failures, wrong URLs, missing redeploys, and misleading browser tests).

---

## Quick start checklist

Complete these **in order** before asking the CMS team to publish:

| # | Owner | Task | Done when |
|---|--------|------|-----------|
| 1 | Site | Deploy `POST /api/cms-webhook` (or equivalent) | `curl -X POST https://yourdomain.com/api/cms-webhook` returns **401**, not **404** |
| 2 | Site | Set `CMS_WEBHOOK_SECRET` on **Production** and **redeploy** | Same curl with secret header returns **2xx** (or **500** with a config message — not **401**) |
| 3 | CMS admin | Set **Webhook URL** + **Webhook Secret** in CMS Admin → Users → your client | Secret matches site env **character for character** |
| 4 | CMS admin | Click **Publish to website** on a test post | Post status becomes **published**, `webhook_status: success` |

---

## How publishing works in the CMS

Understanding this avoids false “it’s broken” reports:

| Action | Pushes to your site? |
|--------|---------------------|
| **Publish to website** (admin button) | **Yes** — CMS `POST`s to your webhook URL |
| Saving post status as **Published** in the editor | **No** — status alone does not call your webhook |
| **Auto-publish** (if enabled on your client) | **Yes** — scheduler calls the same publish flow |

If a post stays in **review** with `webhook_status: failed`, the CMS tried to deliver and your site rejected the request (or the URL was unreachable). Fix the site endpoint first, then retry **Publish to website**.

---

## Who configures what

| Setting | Where it lives | Notes |
|---------|----------------|-------|
| **Webhook URL** | **CMS Admin only** (Users → your client → Webhook) | e.g. `https://yourdomain.com/api/cms-webhook`. **Do not** put this in your site’s env unless you use it for something else. |
| **Webhook secret** | **Both** CMS Admin **and** your site | Same value in both places. On your site: env var **`CMS_WEBHOOK_SECRET`**. |
| **CMS site ID** | CMS Admin (client UUID) | Only needed if you also use the [pull API](CMS_API_V1.md) (`GET /api/v1/sites/{siteId}/posts/...`). |

The CMS **calls your URL**. Your site only needs the route deployed and the secret to verify incoming `POST`s.

---

## 1. Create a webhook endpoint on your site

Expose a URL that accepts **`POST`** with JSON. Common paths:

- `https://yourdomain.com/api/cms-webhook`
- `https://yourdomain.com/api/cms/revalidate`

The CMS calls this URL when a post is **published**, **updated**, or **deleted**.

### Reference implementation (Next.js App Router)

File: `app/api/cms-webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.CMS_WEBHOOK_SECRET;

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CMS_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const headerSecret = req.headers.get("x-webhook-secret");
  const signature = req.headers.get("x-cms-signature");

  const secretOk = headerSecret === WEBHOOK_SECRET;
  const sigOk = verifySignature(rawBody, signature);

  if (!secretOk && !sigOk) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // TODO: upsert post by slug, store cover_image_url, translations, per-locale author
  // TODO: revalidate blog index + post page (or persist to your DB)

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
```

**Auth rules:**

- Accept the request if **`x-webhook-secret`** equals `CMS_WEBHOOK_SECRET`, **or** if **`x-cms-signature`** matches `HMAC-SHA256(rawBody, secret)` (hex).
- Read the body with **`req.text()`** before parsing JSON — the signature is computed over the **exact raw JSON string**, not a re-serialized object.
- Return **2xx** on success. Any other status is recorded as a failed delivery in the CMS.

---

## 2. Set the secret on your site and redeploy

1. CMS admin generates or copies the **Webhook Secret** from CMS Admin → Users → your client.
2. In **Vercel** (or your host), add:

   ```text
   CMS_WEBHOOK_SECRET=<same value as CMS Admin>
   ```

3. Set it on the **Production** environment (Preview-only is a common cause of 401 in production).
4. **Redeploy** after changing env vars — running deployments do not pick up new secrets.

Requirements for the secret value:

- No surrounding quotes in Vercel.
- No trailing spaces or newlines.
- Env name must be exactly **`CMS_WEBHOOK_SECRET`** (not `WEBHOOK_SECRET`, `CMS_SECRET`, etc.).

---

## 3. Verify before registering in CMS Admin

### 3.1 Route exists (no auth)

```bash
curl -i -X POST "https://yourdomain.com/api/cms-webhook" \
  -H "Content-Type: application/json" \
  -d "{}"
```

| Status | Meaning |
|--------|---------|
| **401** | Good — route exists, auth rejected (no/wrong secret). |
| **404** | Route not deployed. Fix deployment before going further. |
| **405** on browser GET | **Expected** — CMS uses POST only. Do not use the browser address bar to test. |

### 3.2 Auth works (with secret)

Replace `YOUR_SECRET` with the value from CMS Admin:

```bash
curl -i -X POST "https://yourdomain.com/api/cms-webhook" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d "{}"
```

| Status | Meaning |
|--------|---------|
| **401** | Secret mismatch, wrong env name, secret only on Preview, or **no redeploy** after adding env. |
| **200 / 204** | Auth passed — wire up payload handling if you still return empty success. |
| **500** with “not configured” | Route deployed but `CMS_WEBHOOK_SECRET` missing in **this** deployment’s environment. |

### 3.3 Webhook URL must be reachable

The URL in CMS Admin must be the **live production domain** that resolves in DNS:

- Use `https://yourdomain.com/...`, not a stale alias or old domain that no longer resolves.
- CMS errors like `fetch failed` or `ENOTFOUND` mean DNS/URL is wrong — not an auth problem.

---

## 4. Configure the webhook in the CMS

A CMS admin sets **your** client’s webhook in **CMS Admin → Users → your client → Webhook**:

1. **Webhook URL** — your live endpoint (e.g. `https://yourdomain.com/api/cms-webhook`).
2. **Webhook Secret** — same string as `CMS_WEBHOOK_SECRET` on your site.
3. Save. Optionally enable **Auto-publish** so new posts are pushed automatically when ready.

After this, use **Publish to website** on a test post (or wait for auto-publish). Confirm `webhook_status: success` in the CMS.

---

## 5. What the CMS sends

- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `x-cms-event`: `post.published` | `post.updated` | `post.deleted` (or legacy `cms.post.*` for older clients)
  - `x-cms-timestamp`: ISO8601 timestamp
  - `x-cms-signature`: HMAC-SHA256 of the **raw JSON body** (hex), using your Webhook Secret
  - `x-webhook-secret`: the raw Webhook Secret (when configured in CMS Admin)

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
    "json_ld": { },
    "locale": "en",
    "author": {
      "name": "...",
      "jobTitle": "...",
      "bio": "...",
      "avatarUrl": "https://..."
    },
    "translations": {
      "en": { "title": "...", "excerpt": "...", "content_md": "...", "author": { } },
      "pt": { "title": "...", "excerpt": "...", "content_md": "...", "author": { } },
      "fr": { }
    }
  },
  "timestamp": "2026-03-16T12:00:05Z",
  "signatureVersion": "v1"
}
```

For `post.deleted`, the payload is minimal (event, siteId, post id/slug, timestamp).

### Author byline vs profile

- **`post.author`** is the structured byline (name, job title, bio, avatar). **Render the article author from this object** (or from **`post.translations[locale].author`** for localized pages), not from HTML inside `content_md` — the CMS strips embedded author blocks from webhook payloads.
- If the account uses **Blog authors** (byline personas), values come from that persona. Editing only the account profile does not update posts tied to a specific persona.

### Cover images

- **`cover_image_url`** is a full absolute HTTPS URL (CMS storage/CDN).
- **Next.js:** whitelist remote image hosts in `next.config.ts` under `images.remotePatterns`, or cover images will appear broken even when the URL is valid.

```ts
// next.config.ts — example wildcard
export default {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
  },
};
```

Or list your CMS storage host explicitly instead of using a wildcard.

---

## 6. Troubleshooting

### `401 Unauthorized` / `{"error":"Unauthorized"}`

The CMS reached your site, but auth failed.

| Likely cause | Fix |
|--------------|-----|
| `CMS_WEBHOOK_SECRET` not set on **Production** | Add env on Production, redeploy |
| Secret only on Preview | Copy to Production, redeploy |
| Secret typo, quotes, or trailing space | Re-copy from CMS Admin; paste without quotes |
| Wrong env var name | Must be `CMS_WEBHOOK_SECRET` |
| Env added but site not redeployed | Trigger a new Production deployment |
| Route checks signature on parsed/re-stringified JSON | Verify HMAC on **raw body** from `req.text()` |
| CMS Admin has no webhook secret | CMS admin must set Webhook Secret in Admin |

### `404 Not Found`

The webhook route is not on the deployed build (wrong path, branch not deployed, or deploy blocked). Deploy the route, then re-run the curl test in [§3.1](#31-route-exists-no-auth).

### `fetch failed` / DNS errors (CMS side)

The **Webhook URL** in CMS Admin is wrong or the domain does not resolve. Update CMS Admin to the correct live URL (e.g. primary domain, not an old alias).

### Browser shows `405 Method Not Allowed`

Normal. The CMS sends **POST**. Opening the URL in a browser sends **GET**. This is **not** evidence that publishing works or fails.

### Post stuck in **review** with good SEO scores

Content is fine; delivery failed. Check `webhook_error` in the CMS, fix the site endpoint, then click **Publish to website** again. Saving status to Published alone will not retry the webhook.

### Cover image broken on site

URL is valid but Next.js blocks the host — add `remotePatterns` (see [§5](#5-what-the-cms-sends)).

### Delivery timeout

CMS waits up to **15 seconds** for your webhook response. Heavy work should be queued; return **2xx** quickly after accepting the payload.

---

## 7. WordPress sites

For WordPress client sites, use the in-repo plugin instead of a custom webhook route:

**Plugin path:** [`wordpress-plugin/witflow-cms/`](../wordpress-plugin/witflow-cms/)

1. Install/activate the plugin (and **Polylang** if you sync pt/en/fr).
2. Open **Settings → Witflow CMS** and set CMS base URL, Site ID, API key, and Webhook secret.
3. Copy the plugin webhook URL: `https://yourdomain.com/wp-json/witflow-cms/v1/webhook`
4. In CMS Admin → Users → client, paste that URL + matching Webhook Secret (`spec` format).
5. **Publish to website** on a test post. The plugin upserts native WP posts (Markdown → HTML, featured image, SEO meta) and links locales via Polylang.

See the plugin [`readme.txt`](../wordpress-plugin/witflow-cms/readme.txt) for curl checks, multilingual notes, and Sync now / Test connection.

---

## 8. Optional: pull content via CMS API

Webhooks push full post data on publish/update. You can also **pull** published posts with the headless API — useful for rebuilds or webhook-only revalidation flows. See [CMS_API_V1.md](CMS_API_V1.md).

Typical env vars for pull (in addition to webhook secret):

```text
CMS_API_BASE_URL=https://<cms-host>
CMS_SITE_ID=<client-uuid-from-cms-admin>
CMS_API_TOKEN=<cms-api-key-or-same-as-webhook-secret>
```

Pull API is optional. For webhook-only integration, **`CMS_WEBHOOK_SECRET` + deployed route** is enough. On WordPress, use the plugin **Sync now** button (same API) instead of wiring env vars manually.

---

## 9. Testing tips

- Inspect payloads with [webhook.site](https://webhook.site) or a tunnel — set that URL temporarily in CMS Admin, publish a test post, then switch back to your production URL.
- The CMS host exposes `POST /api/test-webhook` for internal logging experiments; **your site must still implement its own URL** that production will call.
- After any secret or URL change: verify with curl ([§3](#3-verify-before-registering-in-cms-admin)), then one **Publish to website** from CMS Admin.
- For WordPress: use the curl checks in [`wordpress-plugin/witflow-cms/readme.txt`](../wordpress-plugin/witflow-cms/readme.txt).

---

## Summary

| Step | Where | Action |
|------|--------|--------|
| 1 | Your site | Deploy `POST` handler (or install Witflow CMS WP plugin); verify 401 without secret |
| 2 | Your site | Set webhook secret (env or plugin settings); verify auth with secret |
| 3 | CMS Admin | Set Webhook URL + Webhook Secret (must match site) |
| 4 | CMS Admin | **Publish to website** on a test post; confirm success |
| 5 | Your site | Render author from `post.author` / `translations[locale].author`; allow cover image domains (Next.js) or rely on WP media sideload |

When in doubt, run the two curl commands in [§3](#3-verify-before-registering-in-cms-admin) and share the **status code + response body** with the CMS team — that usually isolates URL, deploy, and auth issues in one step.
