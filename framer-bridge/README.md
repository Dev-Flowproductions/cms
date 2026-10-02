# Witflow → Framer bridge (phase 3)

Single-tenant webhook service: Witflow CMS publish webhook → Framer **Server API** (`framer-api`) → Managed Collection upsert/delete → `publish` (+ optional `deploy`).

Framer sites cannot receive webhooks; the bridge is the receiver. Pair with `framer-plugin` for field setup + Sync pull.

## Official vs out of scope

| Capability | Status |
|------------|--------|
| `connect` / `withConnection`, `getManagedCollections`, `addItems`, `removeItems`, `publish`, `deploy` | Official Server API |
| `getLocales` + `valueByLocale` / `statusByLocale` on `addItems` | Official Localization |
| `formattedText` + `contentType: "markdown"` | Official |
| Item `id` = CMS `post.id` | Official for **Managed** Collections |
| Inbound webhook on the Framer site | Not supported — bridge required |
| Marketplace | Out of scope |

## Prerequisites

1. **Managed Collection** (typically created/configured by `framer-plugin`) whose name matches `FRAMER_COLLECTION_NAME`.
2. Fields (names case-insensitive): `title`, `excerpt`, `content` (Formatted Text), `cover` (Image), `seoTitle`, `metaDescription`.
3. Framer Localization locales for languages you need (auto-matched to CMS `pt` / `en` / `fr`).
4. Framer API key + same webhook secret as Witflow CMS Admin.

## Setup

```bash
cd framer-bridge
cp .env.example .env
# fill .env locally — never commit it, never paste secrets in chat
npm install
npm run dev
```

Webhook: `http://localhost:8787/webhook` · Health: `GET /health`

## Env vars

See `.env.example`. Required: `FRAMER_API_KEY`, `FRAMER_PROJECT_URL`, `FRAMER_COLLECTION_NAME`, `WEBHOOK_SECRET`.

| Var | Purpose |
|-----|---------|
| `DEFAULT_LOCALE` | Base locale for item `value` (`pt` \| `en` \| `fr`) |
| `FRAMER_LOCALE_MAP` | Optional overrides `pt:<id>,en:<id>,fr:<id>` (else `getLocales` auto-match) |
| `FRAMER_AUTO_DEPLOY` | `true` → publish + deploy; `false` → publish only |

## Webhook contract (same as WordPress plugin)

- `POST /webhook`
- Auth: `x-webhook-secret` **or** `x-cms-signature` = HMAC-SHA256(raw body) hex
- Upsert: `post.published`, `post.updated` (+ legacy `cms.post.*`); empty `event` = upsert
- Delete/unpublish: `post.deleted`, `post.unpublished`, `cms.post.deleted` → `removeItems([post.id])` (idempotent)
- Upsert key: `post.id`
- Multi-locale: `translations.pt|en|fr` → `valueByLocale`; cover shared; slug = `post.slug`

## How to test — deletes

```bash
curl -s -X POST http://localhost:8787/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET_FROM_ENV" \
  -d "{\"event\":\"post.deleted\",\"post\":{\"id\":\"THE_CMS_POST_ID\"}}"
```

Expect: `ok: true`, `action: "deleted"`, `removed: true|false`.

## How to test — multi-locale upsert

Send a body with `translations.en`, `translations.pt`, `translations.fr` (same shape as the WordPress plugin). Expect `localesApplied` / `localesSkipped` in the JSON response and localized fields in Framer.

## Dual-write (validated: fallback A)

Intended: bridge and plugin both write the same Managed Collection (by field **names**).

**Validated on the Dev-plugin test project:** Server API `getManagedCollections()` returned **empty** → bridge upsert/delete **not reliable**. Operational path: **plugin Sync** for content. Keep the bridge for webhook auth/event contract; do not depend on it for CMS items until Managed Collections are visible to the Server API. Details: `docs/framer/VALIDATION.md`.

## Next

Marketplace later (plugin pack notes in `framer-plugin/docs/packaging.md`).
