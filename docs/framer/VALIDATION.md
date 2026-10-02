# Framer connector — validation checklist (phase 3 / phase 4 close-out)

## Dual-write result (validated)

**Status: fallback A** — Server API cannot write the plugin-owned Managed Collection in the test project.

Evidence (local test project “Teste”, collection display name matching the Development plugin):

- CMS Publish → bridge webhook succeeds in reaching Framer credentials.
- Bridge resolves collections via `getManagedCollections()` → **count = 0** (`Available: (none)`).
- CMS surfaces: `Managed Collection "…" not found. Available: (none).`
- The same name appears under Framer CMS **Synced** in the editor, and as a **regular** collection via `getCollections()`, but **not** as a Managed Collection visible to the Server API / API key used by `framer-bridge`.

**Operational consequence**

| Path | Use |
|------|-----|
| **Plugin Sync now** | Source of truth for pulling published posts into the Synced collection (requires CMS reachable over HTTPS from the plugin — e.g. tunnel — plus CORS on `/api/v1`) |
| **Bridge webhook** | Auth/event contract OK; do **not** rely on upsert/delete into this Dev Managed Collection until Server API lists it |

Re-check dual-write later if Framer exposes plugin Managed Collections to Server API (non-Dev plugin / product change). Until then, treat bridge write as **blocked**. No dual-write workaround invented in-repo.

---

## Prerequisites

- [x] Framer project has Localization locales for the languages you need (pt/en/fr codes or slugs)
- [x] Managed Collection created via Witflow plugin (fields applied with Save) — visible in editor as **Synced**
- [x] `framer-bridge` `.env` filled locally (never commit)
- [x] Plugin configured (CMS base URL, Site ID, API key, default locale)
- [x] CMS `/api/v1` CORS for Framer plugin origins (local HTTPS + `plugins.framercdn.com`) — for Sync path
- [x] Health reports `phase: 3` (aligned with implemented connector)

## Bridge — deletes

- [ ] Upsert a test item (or Sync now) so `post.id` exists in the collection
- [ ] `POST /webhook` with `event: post.deleted` and `post.id` → `action: "deleted"`, `removed: true`
- [ ] Repeat same delete → `removed: false`, still `ok: true` (idempotent)
- [ ] `event: post.unpublished` behaves like delete (`removeItems`)
- [ ] Item gone in Framer CMS; live site updates if `FRAMER_AUTO_DEPLOY=true`

> **Blocked** — dual-write fallback A (`MANAGED_COUNT=0`). Auth accepted deletes still return collection-not-found (500).

## Bridge — multi-locale upsert

- [ ] Payload with `translations.en`, `.pt`, `.fr` → one item, `id = post.id`, shared `slug`
- [ ] Framer Localization shows values for matched locales
- [ ] Response includes `localesApplied` / `localesSkipped`
- [ ] Update only one locale → other locales remain
- [ ] Cover is shared (same image) across locales
- [ ] Optional `FRAMER_LOCALE_MAP` overrides auto-match when set

> **Blocked** — dual-write fallback A.

## Plugin — Sync now (operator checklist)

Local prerequisites: CMS running; HTTPS tunnel to CMS; plugin Dev open; collection **Synced → Witflow CMS (Development)**.

1. Configure → CMS base URL = tunnel `https://…` (not `http://localhost`) + Site ID + API key + default locale → **Save**
2. **Test connection** → Connection OK
3. **Sync now**
4. Confirm items appear (`id` = CMS `post.id`)
5. Confirm multi-locale: open an item / Localization for pt/en/fr when translations exist
6. Orphans: leave or create an extra item in Framer that is not in CMS → Sync again → that item must **remain** (Sync does not call remove)

Checklist status:

- [x] CORS + HTTPS tunnel path documented for local Test/Sync
- [x] Sync code does **not** remove orphans (verified in `framer-plugin/src/sync.ts` — only `addItems` / field writes)
- [x] Sync now upserts published posts (`id` = CMS `post.id`) — confirmed Sep 29, 2026
- [ ] Sync multi-locale (pt/en/fr) — blocked by Framer plan / Localization upgrade required — connector not validated for multi-locale on this project
- [x] `default_locale` is the base `value` language — confirmed Sep 29, 2026
- [x] Orphan items survive Sync — confirmed Sep 29, 2026

> **Sep 29, 2026:** Sync path OK (upsert + default_locale + orphans). Dual-write remains **fallback A**. Multi-locale pending Framer Localization plan upgrade (not a connector bug).

## Dual-write

- [x] Bridge upsert after plugin Save attempted on the same collection
- [x] Bridge write **failed** → **fallback A** (plugin Sync for content)
- [ ] Bridge upsert succeeds (`MANAGED_COUNT ≥ 1` and name match) — reopen when API visibility changes

## Auth regression

- [x] Missing auth → **401**
- [x] Wrong `x-webhook-secret` → **401**
- [x] Correct `x-webhook-secret` accepted (not 401; body may still 500 under fallback A)
- [x] Correct `x-cms-signature` HMAC-SHA256(raw body) accepted (not 401; same as above)

> Matrix run locally against `/webhook` with a harmless `post.deleted` payload for a nonexistent id. Success statuses were **500** (collection not found), which still proves auth passed.
