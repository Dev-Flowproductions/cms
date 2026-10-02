# Witflow CMS — Framer plugin (phase 3)

Managed Collection plugin: **configure** fields + credentials, **Sync now** (pull) from the Witflow Content API, with **multi-locale** via Framer Localization.

Realtime publish/delete is intended via **`framer-bridge`** (webhook → Server API). **Validated: fallback A** — use **Sync now** for content until Server API can write the Managed Collection. This plugin does not receive webhooks.

## Official APIs

| Feature | API |
|---------|-----|
| `configureManagedCollection` / `syncManagedCollection` | Official Plugin modes |
| `setFields` / `addItems` / `setPluginData` / `getLocales` | Official |
| `formattedText` + `contentType: "markdown"` | Official |
| `valueByLocale` / `statusByLocale` on items | Official Localization |
| Inbound webhook on the Framer site | Not supported — use `framer-bridge` |

## Field schema (aligned with bridge)

| name | type |
|------|------|
| `title` | string |
| `excerpt` | string |
| `content` | formattedText (markdown) |
| `cover` | image (shared across locales) |
| `seoTitle` | string |
| `metaDescription` | string |

Item id = CMS `post.id`. Slug = shared `post.slug`.

## Locales

- Sync writes **pt / en / fr** when present in the Content API response.
- Framer locale IDs are **auto-matched** by `code` / `slug` (no UI map).
- **Default locale** in the UI = base language for the item `value` fields; other locales go to `valueByLocale`.
- Orphan items are **not** removed on Sync (deletes would be bridge webhook only — blocked under fallback A).

## Setup

```bash
cd framer-plugin
npm install
npm run dev
```

Open in Framer:

1. Create/open a Managed Collection with this plugin.
2. Enter CMS base URL, Site ID, API key, default locale → **Save**.
3. **Test connection**, then **Sync now**.
4. Deploy `framer-bridge` and paste its `/webhook` URL into Witflow CMS Admin (help text in the UI — no stored webhook URL field).

## Dual-write

**Status: fallback A** (see `docs/framer/VALIDATION.md`). Prefer **Sync now** for content. Re-test bridge write only if `getManagedCollections()` lists this collection.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local plugin server |
| `npm run build` | Production build |
| `npm run check-typescript` | Typecheck |
| `npm run pack` | Package (see `docs/packaging.md`) |

Marketplace is out of scope.
