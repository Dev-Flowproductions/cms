# Spec Kit — AI-native CMS (Next.js + next-intl + Tailwind + Supabase)

Below is a **Spec Kit** for building the CMS in **Next.js (App Router) + next-intl (PT/EN/FR) + Tailwind + Supabase (Auth + Postgres + Storage)**, aligned to the architecture goals and workflow in your document (multi-agent editorial flow, HITL gate, entity-first content, “Source-and-Cite”, structured data, GEO/AEO metrics).

---

## 1) Product summary

### Mission
Build an **AI-native editorial CMS** that produces **citation-worthy, entity-structured, intent-complete** content and ships it through a **repeatable pipeline** (Research → Draft → Optimize → Format → Review → Publish), with a **Human-in-the-Loop** approval gate.

### Primary outcomes
- Content is **structured for “Source-and-Cite” authority** (entities, evidence, citations, JSON-LD).
- Workflow supports multi-step editorial pipeline + review checklist (HITL).
- Internationalized admin + public blog (PT/EN/FR) with localized content variants.
- Metrics track **GEO/AEO visibility** (citation frequency, AI referrals, sentiment).

---

## 2) Scope

### MVP (must-have)
1. **Auth + roles**
   - Supabase Auth (email + OAuth optional)
   - Roles: Admin, Editor, Reviewer (min)
2. **Blog content**
   - Posts CRUD, statuses, scheduling, tags/categories
   - Localizations (PT/EN/FR) per post
3. **Editorial workflow**
   - Pipeline statuses + assignees
   - HITL approval gate + checklist
4. **Research & citations**
   - Store sources (URLs/notes), attach citations to claims/sections
5. **Structured data**
   - JSON-LD output (Article baseline; optional FAQ/HowTo blocks)
6. **Public blog**
   - SEO-friendly localized routes + post pages
7. **Basic analytics**
   - Track publish events, edits, approvals

### V1 (next)
- Entity library + post↔entity mapping (knowledge-graph-ish)
- Repurposing “Hero → Hub/Hygiene” content outputs (LinkedIn drafts, etc.)
- Background jobs for “agent runs” + queue
- AI-provider adapter (Gemini/OpenAI/etc.) and multi-agent orchestration (stored runs, outputs)

---

## 3) Users & permissions

### Roles
- **Admin**
  - Manage users/roles, site settings, locales, schema templates
- **Editor**
  - Create/edit posts, manage sources/citations, request review, publish (optional)
- **Reviewer**
  - Approve/reject, enforce checklist, lock/unlock publish gate
- (Optional) **Contributor**
  - Draft-only, cannot publish

### Permission rules (high-level)
- Drafts visible only to team roles
- Public sees only `published` + locale fallback rules
- RLS enforced at DB level (see Security)

---

## 4) Content model & workflow

### Post lifecycle states
- `idea` → `research` → `draft` → `optimize` → `format` → `review` → `approved` → `scheduled`/`published` → `archived`

### HITL review checklist (stored + enforceable)
Minimum checklist items:
- Credibility: at least 1 external citation or expert quote
- Brand voice audit
- Entity accuracy (if entity system enabled)
- Intent completeness (why/how/when)
- Formatting: heading hierarchy, tables, snippet eligibility

### Content types
- **Hero** (long-form)
- **Hub** (cluster/supporting)
- **Hygiene** (repurposed snippets)

(Stored as `content_type` on post; can auto-generate child items later.)

---

## 5) Information architecture

### Public site routes (localized)
- `/{locale}` home
- `/{locale}/blog`
- `/{locale}/blog/[slug]`
- `/{locale}/tag/[tag]`
- `/{locale}/category/[category]`
- `/{locale}/author/[author]`
- `/{locale}/sitemap.xml` (locale-aware)
- `/{locale}/rss.xml` (optional)

### Admin routes (localized optional; usually keep admin in EN but can localize UI)
- `/{locale}/admin`
- `/{locale}/admin/posts`
- `/{locale}/admin/posts/new`
- `/{locale}/admin/posts/[id]` (editor)
- `/{locale}/admin/review-queue`
- `/{locale}/admin/sources`
- `/{locale}/admin/entities` (V1)
- `/{locale}/admin/settings`

---

## 6) Tech architecture

### Frontend
- **Next.js App Router**
  - Server Components for read-heavy admin lists + public pages
  - Server Actions for secure mutations (create/update/publish)
- **next-intl**
  - Locale routing: `/{locale}/...` for PT/EN/FR
- **Tailwind CSS**
  - Design system: buttons/inputs/cards, responsive admin layout

### Backend (Supabase)
- **Auth**: Supabase Auth + SSR session handling
- **Database**: Postgres with RLS
- **Storage**: images, OG assets, attachments, exports
- **Edge Functions** (optional MVP, recommended V1):
  - Webhooks (publish), cron repurposing, agent runs

### “Multi-agent” adaptation (when you add AI)
Model the pipeline as:
- `agent_runs` + `agent_tasks` tables
- a queue pattern (cron polling, pg-based queue, or edge function triggers)
- run artifacts stored in DB + Storage

---

## 7) Data model (Supabase / Postgres)

### Core tables (MVP)

#### `profiles`
- `id uuid` (pk, = auth.users.id)
- `display_name text`
- `avatar_url text`
- `created_at timestamptz`

#### `roles`
- `id text` (pk) e.g. `admin|editor|reviewer|contributor`

#### `user_roles`
- `user_id uuid` (fk profiles.id)
- `role_id text` (fk roles.id)
- pk (`user_id`,`role_id`)

#### `posts`
- `id uuid` pk
- `slug text unique`
- `status text` (enum-ish)
- `content_type text` (`hero|hub|hygiene`)
- `primary_locale text` (`pt|en|fr`)
- `author_id uuid` fk profiles
- `cover_image_path text` (Supabase Storage)
- `published_at timestamptz null`
- `scheduled_for timestamptz null`
- `created_at`, `updated_at`

#### `post_localizations`
- `id uuid` pk
- `post_id uuid` fk posts
- `locale text` (`pt|en|fr`)
- `title text`
- `excerpt text`
- `content_md text` (or `content_json jsonb` if using block editor)
- `content_html text` (optional cached render)
- `jsonld jsonb` (generated structured data)
- unique (`post_id`,`locale`)

#### `sources`
- `id uuid` pk
- `url text`
- `title text null`
- `publisher text null`
- `notes text null`
- `created_by uuid`
- `created_at timestamptz`

#### `citations`
- `id uuid` pk
- `post_id uuid`
- `source_id uuid`
- `locale text`
- `quote text null` (keep short)
- `claim text null` (what the citation supports)
- `section_anchor text null` (e.g. `#h2-what-is-x`)
- `created_at`

#### `review_checklists`
- `id uuid` pk
- `post_id uuid`
- `reviewer_id uuid`
- `locale text null` (null = overall)
- `items jsonb` (array of {key,label,passed,notes})
- `status text` (`pending|passed|failed`)
- `created_at`, `updated_at`

### V1 tables (entities + agent runs)

#### `entities`
- `id uuid` pk
- `type text` (Person/Org/Concept/Place/Product)
- `name text`
- `aliases text[]`
- `attributes jsonb`
- `created_at`

#### `post_entities`
- `post_id uuid`
- `entity_id uuid`
- `relevance smallint` (1–5)
- pk (`post_id`,`entity_id`)

#### `agent_runs`
- `id uuid` pk
- `post_id uuid null`
- `status text` (`queued|running|done|failed`)
- `input jsonb`
- `output jsonb`
- `model text null`
- `cost_usd numeric null`
- `created_at`, `updated_at`

#### `agent_tasks`
- `id uuid` pk
- `run_id uuid` fk agent_runs
- `agent_name text` (Research/Writer/Optimizer/Formatter/Reviewer)
- `status text`
- `input jsonb`
- `output jsonb`
- `started_at`, `ended_at`

---

## 8) Security & RLS (Supabase)

### Principles
- All tables default **no access**.
- Public access only to:
  - published posts
  - published localizations
  - safe author/profile fields

### RLS outline
- `posts`/`post_localizations`: team-only CRUD; public read only where `status='published'` and `published_at <= now()`
- `sources`/`citations`: team-only
- `review_checklists`: reviewers+admins write; editors read
- `user_roles`: admins only

### Next.js SSR auth
- Use Supabase SSR helpers to read session in Server Components & Server Actions
- Never expose service role key to client; only on server

---

## 9) i18n spec (next-intl)

### Locale strategy
- Localized routes: `/{locale}/...` with supported locales: `pt`, `en`, `fr`
- Admin UI strings stored in `messages/{locale}.json`
- Content localized via `post_localizations` rows

### Fallback rules
- If locale variant missing, fallback to `primary_locale`
- If still missing, return 404 (or show “not translated yet” in admin preview)

---

## 10) Editor & formatting requirements

### Content format
Pick one (MVP-friendly):
- **Markdown** (`content_md`) + server-side render to HTML
- Optional MDX later

### Formatting guardrails
- Enforce heading hierarchy (H2/H3), tables supported for snippet eligibility, internal linking automation later.

### Structured data
Generate JSON-LD per localization:
- Always: `Article`
- Optional blocks:
  - `FAQPage` if Q&A blocks exist
  - `HowTo` if step blocks exist

---

## 11) Features list (detailed acceptance criteria)

### A) Post management
- Create post (slug uniqueness, primary locale required)
- Edit localization (title, excerpt, content)
- Status transitions require permissions:
  - `review` → `approved` only Reviewer/Admin
  - `approved` → `published` requires checklist pass

### B) Review queue + HITL
- Reviewer sees list of posts in `review`
- Checklist must be completed + pass before `approved`
- Audit log entry on approve/reject (optional table `audit_events`)

### C) Sources & citations
- Add source URL + notes
- Attach citation to post + locale + section anchor
- Show “citation coverage” indicator (e.g., # citations per 1000 words)

### D) Public rendering
- Locale-aware SEO:
  - `hreflang`
  - localized metadata
  - OG tags
- JSON-LD injected into `<head>` per post locale

### E) Repurposing (V1)
- Generate hygiene drafts from a hero post (store as child posts with `parent_post_id`)
- Export to “channel formats” (LinkedIn, etc.)

---

## 12) Next.js folder structure (recommended)

```text
/app
  /[locale]
    /(public)
      /blog
        /[slug]
          page.tsx
      layout.tsx
    /(admin)
      /admin
        /posts
        /review-queue
        /sources
        layout.tsx
  /api
    /revalidate (optional)
/components
/lib
  /supabase
  /auth
  /i18n
  /rendering (md -> html, jsonld builders)
/messages
  en.json
  pt.json
  fr.json
```

---

## 13) Non-functional requirements
- **Performance**: cached public pages, incremental revalidation on publish
- **Reliability**: safe migrations, RLS tests, backups
- **Auditability**: status transitions logged
- **Cost control** (when AI added): store per-run token/cost

---

## 14) Milestones

### Sprint 1 (MVP foundation)
- Next.js + Tailwind + next-intl scaffolding
- Supabase Auth SSR + roles
- DB schema + RLS

### Sprint 2 (CMS core)
- Posts + localizations CRUD
- Markdown editor + preview
- Public blog rendering

### Sprint 3 (Quality + publish)
- Review queue + checklist gate
- Sources/citations
- JSON-LD generator

### Sprint 4 (V1 starters)
- Entities + post_entities
- Agent runs tables + edge function skeleton
- Repurposing drafts
