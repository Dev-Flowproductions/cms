# CMS

Multi-tenant content management for agencies and clients: **AI-assisted blog posts**, **localized content** (Portuguese, English, French), **brand-aware covers**, **SEO/AEO/GEO scoring with an automatic improvement loop**, and **webhooks** to push published posts to client websites.

Built with **Next.js 15** (App Router), **Supabase** (Postgres, Auth, Storage), and **Google Gemini** (text + image + embeddings).

---

## Features

- **Auth** — Supabase email/password; optional **Google OAuth** for Analytics / Search Console–style integrations.
- **Onboarding** — Domain, brand book, manual brand fields; generates and stores **client-specific instructions** used in every AI call.
- **Posts** — Draft / review / published; **primary locale** plus `post_localizations` per locale (title, body, SEO fields, FAQ JSON, JSON-LD, `seo_score`).
- **AI generation** — Gemini drafts JSON (title, `content_md`, meta, FAQs, cover briefs). **Instruction chunks** are **reordered with Gemini Embedding 2** per task (generation, translation, quality loop, cover prefix). **Client instruction sections** are parsed and reordered the same way.
- **Quality loop** — Separate scorer + reviewer + reviser pass; targets a **rounded average** of SEO / AEO / GEO scores. **Publishing** (scheduler, publish API, admin actions) requires average **≥ 90** unless scores are missing (legacy).
- **Covers** — Gemini image model + `buildCoverPrompt`; optional embedding-ranked **CMS + client** text prefix; uploads to Supabase Storage (`covers` bucket).
- **Scheduler** — `POST /api/scheduler` (cron or internal) generates posts on a per-client frequency; can **auto-publish** or leave posts in **review** if the score gate fails.
- **Publish** — `POST /api/publish/[postId]` sends a structured webhook payload to the client’s URL; supports spec / legacy event formats.
- **Admin** — Users, posts across clients, review queue, sources.
- **Dashboard** — Per-author posts, review approvals, account settings.
- **Public site** — Localized marketing pages and blog (under `[locale]`).
- **CMS API (v1)** — Bearer-authenticated routes under `/api/v1/sites/[siteId]/…` for posts, authors, categories, sitemap (for headless consumers).

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 15, React 19, TypeScript |
| i18n | next-intl (`en`, `pt`, `fr`) |
| Data | Supabase (Postgres + RLS, Auth, Storage) |
| AI | `@google/generative-ai`, `@google/genai` (Gemini 3.x–class models for text/image; embedding model for retrieval) |
| Styling | Tailwind CSS |
| Validation | Zod (selected routes) |

---

## Repository layout

```
app/
  [locale]/           # All UI routes are locale-prefixed
    (admin)/admin/    # Admin shell
    (public)/         # Marketing + blog
    dashboard/        # Author dashboard
    onboarding/       # Domain / Google steps
  api/                # REST: agent, scheduler, publish, onboarding, v1 CMS API, Inngest, Google OAuth
lib/
  agent/              # Prompts, instruction chunks, embeddings, quality loop, cover generation
  brand-book/         # Brand book types and helpers
  cms-api/            # Webhook payload builders
  data/               # Supabase data access helpers
  supabase/           # Browser/server/admin Supabase clients
supabase/migrations/  # SQL migrations (source of schema truth)
```

**Instruction pipeline (high level)**

1. **`instruction-chunks.ts`** — Global rules (fixed prefix/suffix + rankable middle sections).
2. **`instruction-embeddings.ts`** — Builds task queries, ranks chunks, cover prefix assembly.
3. **`client-instruction-embeddings.ts`** — Parses `custom_instructions` into sections and ranks them with the same query.
4. **`instructions.ts`** — Composes system + user messages for generation.
5. **`generate-client-instructions.ts`** — Builds the stored client text (keep `BRAND …` / `WEBSITE` headers for parsing).

---

## Prerequisites

- **Node.js** 20+ (recommended)
- **Supabase** project (URL, anon key, service role for server/admin)
- **Google AI Studio** (or Cloud) API key with Gemini access
- **Google OAuth** credentials (if using Google connect)

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (client + server user context) |
| `SUPABASE_SERVICE_ROLE_KEY` | Recommended | Bypasses RLS for admin jobs, webhooks, scheduler |
| `GEMINI_API_KEY` | Yes | All Gemini text, image, and embedding calls |
| `NEXT_PUBLIC_APP_URL` | Yes | OAuth redirects, internal publish calls |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | If using Google | OAuth |
| `CRON_SECRET` | If using secured scheduler | `Authorization: Bearer <secret>` for `POST /api/scheduler` |
| `GEMINI_EMBEDDING_MODEL` | No | Override default `gemini-embedding-2-preview` |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL for public metadata / sitemap |

---

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local

# Apply migrations to your Supabase project (CLI or SQL editor)
# supabase db push   # if using Supabase CLI linked project

npm run dev
```

Open `http://localhost:3000` (locale routing will redirect, e.g. `/en`).

```bash
npm run build    # production build
npm run start    # run production server
npm run lint     # ESLint
```

---

## Database

Schema is defined under `supabase/migrations/`. Notable tables:

- `profiles`, `user_roles`, `roles` — users and admin flag
- `clients` — tenant config: domain, brand, webhooks, scheduler fields, `custom_instructions`
- `posts`, `post_localizations` — content and per-locale SEO/JSON-LD
- `agent_runs` — AI run logging
- `review_checklists`, `audit_events` — optional review flows

Storage buckets (see migrations): **`covers`**, **`logos`**.

---

## API overview

| Endpoint | Purpose |
|----------|---------|
| `POST /api/agent/generate` | Authenticated: generate/refresh post body for a locale |
| `POST /api/agent/cover` | Authenticated: generate cover image for a post |
| `POST /api/scheduler` | Cron/internal: due clients get new posts (Bearer `CRON_SECRET` or admin session) |
| `GET /api/scheduler/trigger` | Rate-limited traffic trigger (optional) |
| `POST /api/publish/[postId]` | Publish + webhook (admin or `x-scheduler-internal: 1`); enforces SEO average gate when scores exist |
| `POST /api/onboarding/*`, `POST /api/brand-book` | Onboarding and brand book |
| `/api/v1/sites/[siteId]/*` | CMS API (Bearer token from client config) |

Exact payloads are defined in route handlers under `app/api/`.

---

## Deployment notes

- Set all production env vars on the host (e.g. Vercel).
- Ensure **Supabase** redirect URLs and **Google OAuth** redirect URIs include `https://<your-domain>/api/google/callback` (and locale variants if applicable).
- **Scheduler**: call `POST /api/scheduler` on a schedule with `Authorization: Bearer <CRON_SECRET>`, or rely on your own trigger strategy.
- **Webhooks**: client sites must expose HTTPS endpoints; secrets and event format are configured per client in the database.

---

## License

Private / internal — not licensed for redistribution unless you add a license file.
