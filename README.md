# AI-Native CMS

Next.js (App Router) + next-intl (PT/EN/FR) + Tailwind + Supabase editorial CMS with HITL review, sources/citations, and JSON-LD.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` – your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon key
   - `SUPABASE_SERVICE_ROLE_KEY` – (optional) for admin operations that bypass RLS
   - `NEXT_PUBLIC_SITE_URL` – public site URL (for sitemap and JSON-LD), e.g. `https://yoursite.com`

3. **Database**
   Apply migrations in `supabase/migrations/` in order (e.g. with Supabase CLI or MCP):
   ```bash
   supabase db push
   ```
   Or run each SQL file in the Supabase SQL editor.

4. **Storage**
   Create a storage bucket named `covers` (public) and apply the policies in `supabase/migrations/20240304000011_storage_covers.sql`, or create the bucket in the dashboard and allow public read + authenticated upload.

5. **First admin**
   Sign up via the app, then assign the admin role in Supabase:
   ```sql
   insert into public.user_roles (user_id, role_id)
   select id, 'admin' from auth.users where email = 'your@email.com' limit 1;
   ```

## Run

```bash
npm run dev
```

- Public: `http://localhost:3000/en` (or `/pt`, `/fr`)
- Admin: `http://localhost:3000/en/admin` (login required; user must have a role)
- Login: `http://localhost:3000/en/login`

## Features

- **Auth & roles**: Admin, Editor, Reviewer, Contributor (see `user_roles` and RLS).
- **Posts**: CRUD, slug, status lifecycle, primary locale, content type (hero/hub/hygiene), cover image.
- **Localizations**: Per-post PT/EN/FR (title, excerpt, Markdown content).
- **Review queue**: Posts in `review`; checklist (credibility, brand voice, etc.); Approve/Reject; only Reviewer/Admin can approve; checklist must pass before approval.
- **Publish**: Approved → Published (sets `published_at`); audit events logged.
- **Sources & citations**: Admin sources list; attach citations to posts per locale.
- **Public blog**: Locale-aware list and post pages; Markdown → HTML; JSON-LD Article; metadata and hreflang.
- **Sitemap**: `/sitemap.xml` with locale-prefixed URLs.
