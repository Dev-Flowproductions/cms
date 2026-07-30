# Witflow CMS — Project Handbook

**Purpose of this file:** Everything you need to understand, copy, and stand up this CMS in a new environment.  
**Secrets:** This document uses **placeholders only**. Never paste real keys here. Real values live in `.env.local` (gitignored) or your host’s env UI (e.g. Vercel).

Related shorter docs live under [`docs/`](./) and the root [`README.md`](../README.md). This handbook is the deep copy/setup guide.

---

## Table of contents

1. [What this product is](#1-what-this-product-is)
2. [Architecture overview](#2-architecture-overview)
3. [Tech stack](#3-tech-stack)
4. [Repository map](#4-repository-map)
5. [Fresh copy checklist](#5-fresh-copy-checklist)
6. [Environment variables](#6-environment-variables)
7. [Supabase setup](#7-supabase-setup)
8. [Data model & multi-tenancy](#8-data-model--multi-tenancy)
9. [Local development](#9-local-development)
10. [AI system](#10-ai-system)
11. [Scheduler & publishing](#11-scheduler--publishing)
12. [CMS Content API v1](#12-cms-content-api-v1)
13. [Client site webhooks](#13-client-site-webhooks)
14. [WordPress plugin](#14-wordpress-plugin)
15. [Demand Generation (DG) integration](#15-demand-generation-dg-integration)
16. [Google OAuth](#16-google-oauth)
17. [Inngest](#17-inngest)
18. [UI routes](#18-ui-routes)
19. [API routes](#19-api-routes)
20. [Deployment (Vercel)](#20-deployment-vercel)
21. [Ops scripts](#21-ops-scripts)
22. [Security notes](#22-security-notes)
23. [Doc index](#23-doc-index)
24. [Common failure modes](#24-common-failure-modes)

---

## 1. What this product is

**Witflow CMS** is a **multi-tenant AI editorial CMS** for agencies and clients.

It:

- Generates localized blog posts (**Portuguese, English, French**)
- Builds **brand-aware cover images**
- Scores and improves content for **SEO / AEO / GEO** (target average ≥ **90** before publish)
- Stores content as the **source of truth**
- **Pushes** published posts to each client’s website via **webhooks**
- Optionally exposes a **headless Content API** for pull-based sites
- Ships a **WordPress plugin** that receives webhooks and upserts native WP posts (Polylang for locales)

**Direction of truth for client sites:** CMS → website (not the other way around).

---

## 2. Architecture overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Next.js 15 (App Router)                      │
│  Locale UI (en/pt/fr)  │  Admin / Dashboard  │  API routes       │
│  middleware: next-intl + Supabase session + admin gate           │
└───────────────┬───────────────────────────────┬──────────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────┐     ┌───────────────────────────────┐
│ Supabase                  │     │ AI providers                  │
│ • Auth (email/password)   │     │ • Gemini (default)            │
│ • Postgres + RLS          │     │ • OpenAI (alt / fallback)     │
│ • Storage (covers/logos/  │     │ text · embeddings · images    │
│   brand-assets)           │     └───────────────────────────────┘
└───────────────┬───────────┘
                │
        ┌───────┴────────────────────────────────────────┐
        ▼                       ▼                        ▼
  Inngest jobs            Client websites           DG product
  (scheduler, DG)         webhooks + API v1         briefs ↔ status
                          WordPress plugin
```

**Typical content lifecycle**

1. User/client onboarding → domain, brand, `custom_instructions`
2. Scheduler or manual/admin/DG brief triggers generation
3. AI drafts post + localizations + cover
4. Quality loop raises SEO/AEO/GEO average toward ≥ 90
5. Status `review` or auto-publish if gate + `auto_publish` allow
6. `POST /api/publish/[postId]` → client webhook (HMAC)
7. Client site (Next.js route or WordPress plugin) upserts content

---

## 3. Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Package manager | **npm** (`package-lock.json`) |
| Node | **20+** recommended |
| i18n | `next-intl` — locales `en`, `pt`, `fr` |
| Data / Auth / Storage | Supabase |
| Jobs | Inngest |
| AI | `@google/genai`, `@google/generative-ai`, optional `openai` |
| Validation | Zod (selected routes) |
| Styling | Tailwind CSS |
| Hosting (typical) | Vercel |

npm scripts:

```bash
npm run dev      # next dev --turbopack
npm run build
npm run start
npm run lint
```

---

## 4. Repository map

```
app/
  [locale]/                 # All UI is locale-prefixed
    (admin)/admin/           # Cross-tenant admin
    (public)/                # Public blog + legal pages
    dashboard/               # Author dashboard
    login/
    onboarding/
  api/                       # REST + Inngest serve endpoint
  sitemap.ts
components/                  # Shared UI
lib/
  agent/                     # Prompts, embeddings, quality loop, covers
  brand-book/
  cms-api/                   # Auth, data, webhook signing for v1 / publish
  data/
  integrations/dg/
  inngest/
  publish/
  scheduler/
  supabase/                  # Browser / server / admin clients
supabase/migrations/         # Schema source of truth (apply in order)
docs/                        # Specs and setup guides (this handbook lives here)
scripts/                     # Ops / one-off Node scripts (not npm scripts)
wordpress-plugin/witflow-cms/
messages/                    # next-intl catalogs
i18n/                        # routing + request config
middleware.ts
vercel.json                  # Daily cron → /api/scheduler/trigger
.env.example                 # Env template (safe to commit)
.env.local                   # Real secrets (gitignored — never commit)
```

---

## 5. Fresh copy checklist

Use this when cloning the project to a new machine or standing up a new environment.

### A. Code

1. Clone the git repo.
2. Install **Node.js 20+**.
3. `npm install`
4. `cp .env.example .env.local`
5. Fill `.env.local` with **your** new project’s keys (see [§6](#6-environment-variables)). Do not reuse production secrets in a throwaway local copy unless you intend to touch production data.

### B. Supabase (new project)

1. Create a Supabase project.
2. Copy **Project URL**, **anon key**, **service_role key** into `.env.local`.
3. Apply **all** SQL files in `supabase/migrations/` in **timestamp filename order**  
   (`supabase db push` if CLI is linked, or run them in the SQL editor).
4. Confirm Storage buckets exist: **`covers`**, **`logos`**, **`brand-assets`**.
5. In Supabase Auth → URL configuration, set Site URL and redirect URLs for local/prod (e.g. `http://localhost:3000/**`, `https://your-cms-domain/**`).

### C. AI

1. Create a Gemini API key (Google AI Studio / Cloud) **or** OpenAI key.
2. Set `AI_PROVIDER=gemini` (default) + `GEMINI_API_KEY`, or `AI_PROVIDER=openai` + `OPENAI_API_KEY`.

### D. App URL & secrets

1. Set `NEXT_PUBLIC_APP_URL` to the public base URL (no trailing slash), e.g. `http://localhost:3000` or `https://cms.example.com`.
2. Generate a cron secret: `openssl rand -hex 32` → `CRON_SECRET`.

### E. Optional features

| Feature | What to configure |
|---------|-------------------|
| Google connect | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` + OAuth redirect `…/api/google/callback` |
| Inngest | Connect Inngest to Vercel (or run local Inngest Dev Server) — see [`INNGEST_SETUP.md`](./INNGEST_SETUP.md) |
| DG | `DG_INTEGRATION_BEARER_SECRET`, `DG_STATUS_WEBHOOK_URL`, `DG_STATUS_WEBHOOK_BEARER_SECRET` |
| Canonical public URL | `NEXT_PUBLIC_SITE_URL` (sitemap / metadata) |

### F. First admin user

1. `npm run dev` → open `http://localhost:3000` → sign up / log in.
2. Promote that user to **admin** in Supabase: insert into `user_roles` with the `admin` role (or use `scripts/seed-users.mjs` if you adapt it for your env).
3. Complete onboarding (domain / brand) for a client account.
4. As admin, set webhook URL + secret (and note **Site ID** = `clients.id` UUID).

### G. Verify

- [ ] Login works  
- [ ] Create/generate a post  
- [ ] Cover generation works  
- [ ] `POST /api/scheduler` with Bearer `CRON_SECRET` returns OK (or admin “Run scheduler”)  
- [ ] Publish webhook delivers (`webhook_status: success`)  
- [ ] Optional: WP plugin or headless API pull  

### H. Production deploy

1. Deploy to Vercel (or equivalent).
2. Set **all** production env vars in the host UI (never commit them).
3. Connect Inngest; confirm scheduler fires.
4. Confirm Google / Supabase redirect URLs include the production domain.
5. Point client sites at the production CMS URL.

---

## 6. Environment variables

**Source of truth for names:** [`.env.example`](../.env.example).  
**Never commit** `.env`, `.env.local`, or real values.

### Required for a working CMS

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key (browser + user-scoped server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — bypasses RLS for scheduler, publish, admin jobs, many scripts. Treat as a root secret. |
| `NEXT_PUBLIC_APP_URL` | Public app URL (OAuth redirects, server self-calls). No trailing slash. |
| `GEMINI_API_KEY` | Required when `AI_PROVIDER=gemini` (default) |

### AI provider options

| Variable | Purpose |
|----------|---------|
| `AI_PROVIDER` | `gemini` (default) or `openai` |
| `GEMINI_TEXT_MODEL` | Optional; default `gemini-3.1-flash-lite` |
| `GEMINI_EMBEDDING_MODEL` | Optional; default `gemini-embedding-2` |
| `GEMINI_IMAGE_MODEL` | Optional; default `gemini-3.1-flash-image` |
| `GEMINI_VISION_MODEL` | Optional; reference banner vision |
| `OPENAI_API_KEY` | Required if `AI_PROVIDER=openai`; optional fallback when using Gemini |
| `OPENAI_TEXT_MODEL` / `OPENAI_IMAGE_MODEL` / `OPENAI_EMBEDDING_MODEL` / … | Optional OpenAI model overrides |

### Scheduler / cron

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Bearer token for `POST /api/scheduler` (Inngest, external cron, admin tooling). Generate with `openssl rand -hex 32`. |

### Google OAuth (optional)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Shared OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Shared OAuth app secret |

Redirect URI pattern: `{NEXT_PUBLIC_APP_URL}/api/google/callback`

### Demand Generation (optional)

| Variable | Purpose |
|----------|---------|
| `DG_INTEGRATION_BEARER_SECRET` | Auth for incoming `POST /api/integrations/dg/article-briefs` |
| `DG_STATUS_WEBHOOK_URL` | Outbound CMS → DG status URL |
| `DG_STATUS_WEBHOOK_BEARER_SECRET` | Bearer CMS sends to DG |

### Inngest (usually set by Vercel integration)

| Variable | Purpose |
|----------|---------|
| `INNGEST_EVENT_KEY` | Send events |
| `INNGEST_SIGNING_KEY` | Verify Inngest → app requests |

See [`INNGEST_SETUP.md`](./INNGEST_SETUP.md).

### Other optional

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical public site URL for sitemap/metadata |

### Example `.env.local` shape (placeholders only)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_KEY
CRON_SECRET=YOUR_RANDOM_HEX_SECRET
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# OPENAI_API_KEY=
# DG_INTEGRATION_BEARER_SECRET=
# DG_STATUS_WEBHOOK_URL=
# DG_STATUS_WEBHOOK_BEARER_SECRET=
```

---

## 7. Supabase setup

### Auth

- Email/password via Supabase Auth
- `profiles` row created on signup (trigger on `auth.users`)
- Session refresh handled in `middleware.ts` + `lib/supabase/*`

### Migrations

All schema lives in [`supabase/migrations/`](../supabase/migrations/). Apply **in filename order**. Do not invent parallel schemas for a copy — reuse these migrations.

### Storage buckets

| Bucket | Typical use |
|--------|-------------|
| `covers` | Post cover images (`{postId}/…`) |
| `logos` | Client logos (`{userId}/…`) |
| `brand-assets` | Cover reference images, guidelines assets (`{userId}/…`) |

### RLS (high level)

- Authors manage **their own** posts / localizations
- Admins (`user_roles` → `admin`) can manage across tenants
- Public read of **published** content where policies allow
- Server jobs use **service role** and must be carefully gated by app auth (`CRON_SECRET`, admin session, etc.)

Tenant hardening migration of note: `20260707120000_tenant_rls_storage_indexes.sql`.

---

## 8. Data model & multi-tenancy

### Tenant = `clients` row

- One primary client config per user (`clients.user_id` → `auth.users`)
- **`clients.id` (UUID) = Site ID** for Content API, webhooks payload `siteId`, DG
- Important fields: domain, brand colors/logo/brand book, `custom_instructions`, frequency, webhook URL/secret/event format, `auto_publish`, `cms_api_key`, `blog_base_path`, `post_locale`, cover refs, Google tokens, scheduler tracking

### Roles

- Simplified to **`admin`** and **`user`** (see migrations that collapse older roles)
- Admins use `/[locale]/admin/*`
- Users use `/[locale]/dashboard/*`

### Content

| Entity | Notes |
|--------|--------|
| `posts` | Slug, status, primary_locale, author_id, cover, byline_author_id, tags/category, webhook delivery fields |
| `post_localizations` | Per locale (`pt`/`en`/`fr`): title, excerpt, content_md, SEO fields, FAQ, JSON-LD, seo_score |
| `blog_authors` | Optional byline personas |
| `sources` / `citations` | Research / claim citations |
| `agent_runs` / `ai_token_usage` | AI logging / cost monitoring |
| `dg_integration_records` | DG brief intake + status webhook bookkeeping |
| `scheduler_meta` | Rate limit for traffic trigger |

### Publish quality gate

When SEO scores exist, publishing requires a **rounded average of SEO / AEO / GEO ≥ 90**. Missing scores may allow legacy publish paths — see publish/scheduler code.

---

## 9. Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with placeholders replaced by your keys

# Apply migrations to Supabase (CLI or SQL editor)

npm run dev
```

Open `http://localhost:3000` (redirects into a locale, e.g. `/en/login`).

Optional local Inngest:

```bash
npx --ignore-scripts=false inngest-cli@latest dev
```

---

## 10. AI system

Core code: [`lib/agent/`](../lib/agent/).

| Piece | Role |
|-------|------|
| `instruction-chunks.ts` | Global CMS rules (fixed + rankable sections) |
| `instruction-embeddings.ts` | Embed + reorder chunks per task query |
| `client-instruction-embeddings.ts` | Parse/rank `custom_instructions` |
| `instructions.ts` | Compose system/user prompts |
| `generate-client-instructions.ts` | Build stored client instruction text from brand/onboarding |
| `execute-generate-post.ts` | Main generation path |
| `score-post.ts` / `seo-reviewer.ts` / `post-reviser.ts` / `improve-to-90.ts` | Quality loop |
| Cover pipeline | `buildCoverPrompt`, cover routes, optional `cover-text-policy.ts` (honors client “no text on image” rules) |
| `ai-config.ts` | Provider selection |

Authenticated agent APIs include:

- `POST /api/agent/generate`
- `POST /api/agent/cover`
- Optimize / coach / improve routes under `app/api/agent/`

Deeper cover notes: [`COVER_IMAGE_GENERATION.md`](./COVER_IMAGE_GENERATION.md).

---

## 11. Scheduler & publishing

### Scheduler

- **`POST /api/scheduler`** — finds due clients by frequency + `last_post_generated_at`; generates posts; may auto-publish
- Auth: `Authorization: Bearer <CRON_SECRET>`, or admin session, or internal traffic mechanisms documented in code
- **`GET /api/scheduler/trigger`** — rate-limited trigger (also used by Vercel cron)

Frequencies on clients include: `daily`, `weekly`, `every3days`, `biweekly`, `monthly`.

### Layered triggers (production)

1. **Inngest** scheduled function → calls `/api/scheduler` (see `lib/inngest/functions.ts`; interval may be every few minutes)
2. **Vercel cron** (`vercel.json`): daily `0 8 * * *` → `/api/scheduler/trigger`
3. Optional **traffic-based** trigger in the app (rate-limited via `scheduler_meta`)

### Publish

- **`POST /api/publish/[postId]`** — builds webhook payload, signs it, POSTs to client `webhook_url`, updates `webhook_status`
- Can be invoked by admin UI (“Publish to website”) or internal scheduler header
- Delete/unpublish paths also fire delete-style webhook events

Payload includes post id, slug, cover, primary fields, and **`translations`** per locale (`content_md`, SEO, author, etc.).

---

## 12. CMS Content API v1

Full contract: [`CMS_API_V1.md`](./CMS_API_V1.md).

Base: `/api/v1/sites/{siteId}/…`  
`siteId` = `clients.id` UUID  

**Auth (server-to-server):**

- `Authorization: Bearer <key>` **or**
- `x-api-key: <key>`

Key = client `cms_api_key` **or** webhook secret (both accepted).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/posts?status=published` | List posts |
| GET | `/posts/{slug}` | Full post |
| GET | `/authors` | Authors with published posts |
| GET | `/categories` | Currently stub `[]` |
| GET | `/sitemap` | Slug + dates |

---

## 13. Client site webhooks

Operational guide: [`SITE_WEBHOOK_SETUP.md`](./SITE_WEBHOOK_SETUP.md).

**CMS Admin → Users → client** configures:

- Webhook URL (HTTPS endpoint on the client site)
- Webhook Secret (shared)
- Event format: prefer **`spec`** (`post.published` / `post.updated` / `post.deleted`)

**Headers CMS sends:**

- `Content-Type: application/json`
- `x-cms-event`
- `x-cms-timestamp`
- `x-cms-signature` = HMAC-SHA256(**raw body**, secret) hex
- `x-webhook-secret` = raw secret (when configured)

Client must verify signature **or** raw secret, then upsert/delete content. CMS waits ~15s; return **2xx** on success.

---

## 14. WordPress plugin

Path: [`wordpress-plugin/witflow-cms/`](../wordpress-plugin/witflow-cms/)

| Item | Detail |
|------|--------|
| Endpoint | `POST /wp-json/witflow-cms/v1/webhook` |
| Behavior | Verify auth → Markdown→HTML → upsert WP posts → sideload cover → SEO meta |
| Locales | `pt` / `en` / `fr` linked via **Polylang** (required for multi-locale) |
| Settings | CMS base URL, Site ID, API key, webhook secret, locale map |
| Extras | Test connection + Sync now (pull API) |

Install: copy folder to `wp-content/plugins/`, activate, configure **Settings → Witflow CMS**, paste webhook URL into CMS Admin.

See plugin `readme.txt`.

---

## 15. Demand Generation (DG) integration

Canonical contract: [`00_shared_integration_contract_dg_ai_cms.md`](./00_shared_integration_contract_dg_ai_cms.md)  
Implementation notes: [`DG_INTEGRATION.md`](./DG_INTEGRATION.md)

| Direction | Endpoint / mechanism |
|-----------|----------------------|
| DG → CMS | `POST /api/integrations/dg/article-briefs` (Bearer `DG_INTEGRATION_BEARER_SECRET`) |
| CMS processing | Rows in `dg_integration_records` + Inngest generation |
| CMS → DG | Status webhooks to `DG_STATUS_WEBHOOK_URL` with Bearer |

Admin retry path exists under `/api/admin/integrations/dg/…`.

---

## 16. Google OAuth

Used for Google Analytics / Search Console–style **connect** during onboarding (not for CMS login itself).

- Routes: `app/api/google/oauth`, `app/api/google/callback`
- Credentials: env `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (app-level, shared)
- Tokens stored on the `clients` row

---

## 17. Inngest

- Serve route: `app/api/inngest` (long `maxDuration` for AI work)
- Functions include: run scheduler, DG brief generation, DG status webhook delivery
- Setup: [`INNGEST_SETUP.md`](./INNGEST_SETUP.md)

**Note:** Docs and code may disagree slightly on cron interval — trust `lib/inngest/functions.ts` for the live schedule.

---

## 18. UI routes

All UI is under `/{locale}/…` with `localePrefix: "always"` (`en` | `pt` | `fr`).

### Admin (requires login + admin role)

| Path | Purpose |
|------|---------|
| `/[locale]/admin` | Admin home |
| `/[locale]/admin/users` | Client accounts |
| `/[locale]/admin/users/[userId]` | Per-client config (webhook, Site ID, brand, scheduler) |
| `/[locale]/admin/posts` | All posts |
| `/[locale]/admin/posts/new` | Create |
| `/[locale]/admin/posts/[id]` | Edit / AI / cover / publish |
| `/[locale]/admin/review-queue` | Review |
| `/[locale]/admin/sources` | Sources |
| `/[locale]/admin/token-usage` | AI token usage |

### Author dashboard

| Path | Purpose |
|------|---------|
| `/[locale]/dashboard` | Home |
| `/[locale]/dashboard/posts` | Own posts |
| `/[locale]/dashboard/new` | Create |
| `/[locale]/dashboard/settings` | Settings |
| `/[locale]/dashboard/blog-authors` | Byline personas |
| `/[locale]/onboarding/domain` | Domain onboarding |
| `/[locale]/onboarding/google` | Google connect |
| `/[locale]/login` | Login |

### Public

| Path | Purpose |
|------|---------|
| `/[locale]/blog` | Public blog index (secondary; client sites are primary) |
| `/[locale]/blog/[slug]` | Public post |
| `/[locale]/privacy`, `/[locale]/terms` | Legal |

---

## 19. API routes (summary)

| Area | Examples |
|------|----------|
| Agent | `/api/agent/generate`, `/api/agent/cover`, optimize/coach routes |
| Scheduler | `/api/scheduler`, `/api/scheduler/trigger` |
| Publish | `/api/publish/[postId]` |
| CMS API v1 | `/api/v1/sites/[siteId]/posts`, `…/authors`, `…/sitemap`, … |
| Onboarding / brand | `/api/onboarding/*`, `/api/brand-book` |
| Google | `/api/google/oauth`, `/api/google/callback` |
| DG | `/api/integrations/dg/article-briefs`, admin DG triggers |
| Inngest | `/api/inngest` |
| Test sink | `/api/test-webhook` (dev/logging experiments) |

Exact request/response shapes live in the route handlers under `app/api/`.

---

## 20. Deployment (Vercel)

1. Import the GitHub repo into Vercel.
2. Set env vars in Vercel (Production + Preview as needed). Prefer Production secrets that match live Supabase.
3. Deploy; confirm `NEXT_PUBLIC_APP_URL` is the **stable production domain**, not a one-off preview URL, for OAuth and self-fetches.
4. Connect **Inngest** integration so signing/event keys are set and functions sync.
5. Confirm `vercel.json` cron is active (`GET /api/scheduler/trigger` daily at 08:00 UTC).
6. Update Supabase Auth URLs and Google OAuth redirects for production.
7. Smoke-test: login → generate → publish → client webhook success.

Long-running AI routes use elevated `maxDuration` (e.g. 300s) where configured.

---

## 21. Ops scripts

Under [`scripts/`](../scripts/). These are **manual** Node scripts (not npm scripts). Most need:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Examples of categories:

| Category | Examples |
|----------|----------|
| Seed / auth | `seed-users.mjs`, `update-auth-urls.mjs` |
| Scheduler | `test-scheduler.mjs`, `recover-stuck-scheduler-drafts.mjs` |
| Publish / webhooks | `republish-clients.mjs`, various `fix-*-publish.mjs` |
| Covers | `regenerate-post-cover-local.mjs`, cover test scripts |
| Content migrations | `migrate-compensall-static-posts.mjs`, FAQ/heading normalizers |
| Client diagnostics | Flow / Bizin probe and cleanup scripts |

Treat scripts as **privileged**. Run only against the intended project; prefer dry-runs when available.

---

## 22. Security notes

- **Never commit** `.env.local` or service role / API keys.
- Service role bypasses RLS — only use on the server / trusted scripts.
- Webhook receivers must verify HMAC or shared secret; reject otherwise with **401**.
- Content API keys are per-tenant; treat like passwords.
- Admin UI is gated by middleware + `user_roles`.
- Cron/scheduler endpoints must not be left open without `CRON_SECRET` (or equivalent) in production.
- When copying the project, **rotate** all secrets (Supabase keys, Gemini/OpenAI, CRON, DG, Google OAuth) rather than cloning production secrets into a shared doc or chat.

---

## 23. Doc index

| Doc | When to read it |
|-----|-----------------|
| [`README.md`](../README.md) | Quick start + feature overview |
| **This handbook** | Full copy/setup knowledge |
| [`CMS_API_V1.md`](./CMS_API_V1.md) | Headless pull API + webhook contract summary |
| [`SITE_WEBHOOK_SETUP.md`](./SITE_WEBHOOK_SETUP.md) | Client website webhook setup & troubleshooting |
| [`COVER_IMAGE_GENERATION.md`](./COVER_IMAGE_GENERATION.md) | Cover image pipeline |
| [`INNGEST_SETUP.md`](./INNGEST_SETUP.md) | Inngest ↔ Vercel |
| [`DG_INTEGRATION.md`](./DG_INTEGRATION.md) | DG implementation in this repo |
| [`00_shared_integration_contract_dg_ai_cms.md`](./00_shared_integration_contract_dg_ai_cms.md) | Canonical DG ↔ CMS contract |
| [`02_ai_cms_spec_receive_dg_briefs_and_sync_status.md`](./02_ai_cms_spec_receive_dg_briefs_and_sync_status.md) | CMS-side DG spec |
| [`speckit_headless_blog_integration.md`](./speckit_headless_blog_integration.md) | Headless blog integration spec |
| [`spec-kit-cms.md`](./spec-kit-cms.md) | Original product/architecture kit |
| [`witflow_cms_connector_spec_kit/`](./witflow_cms_connector_spec_kit/) | Productised connector kit (Next.js first; WP later in phase planning) |
| [`wordpress-plugin/witflow-cms/readme.txt`](../wordpress-plugin/witflow-cms/readme.txt) | WP plugin install & test checklist |

---

## 24. Common failure modes

| Symptom | Likely cause |
|---------|--------------|
| Auth / empty data | Wrong Supabase URL/keys; migrations not applied |
| AI errors | Missing/invalid `GEMINI_API_KEY` or `OPENAI_API_KEY`; wrong `AI_PROVIDER` |
| Scheduler never runs | Missing `CRON_SECRET`; Inngest not connected; cron not firing |
| Publish `webhook_status: failed` | Client URL wrong/DNS; secret mismatch; site returned non-2xx; timeout > ~15s |
| Webhook 401 on site | Secret mismatch; signature computed on re-serialized JSON instead of raw body |
| Multi-locale WP fails with 503 | Polylang missing or language slugs not mapped |
| OAuth redirect errors | `NEXT_PUBLIC_APP_URL` / Google console redirect URI mismatch |
| Preview deploy breaks OAuth | Using ephemeral preview URL instead of stable production `NEXT_PUBLIC_APP_URL` |

---

## Quick “copy this project” summary

1. Clone repo → `npm install`  
2. New Supabase project → apply `supabase/migrations/*` in order  
3. Copy `.env.example` → `.env.local` → fill **your** keys only  
4. Set `NEXT_PUBLIC_APP_URL` + AI key + `CRON_SECRET`  
5. `npm run dev` → create user → grant admin → onboard client  
6. Deploy to Vercel → set prod env → connect Inngest  
7. Configure client webhooks (or WordPress plugin) using Site ID + secret  

**Do not** put real API keys, service role keys, or webhook secrets into git, Notion exports of this file, or chat logs.
