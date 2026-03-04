-- Post localizations
create table public.post_localizations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  locale text not null check (locale in ('pt', 'en', 'fr')),
  title text not null default '',
  excerpt text not null default '',
  content_md text not null default '',
  content_html text,
  jsonld jsonb,
  unique (post_id, locale)
);

create index post_localizations_post_id_idx on public.post_localizations(post_id);

alter table public.post_localizations enable row level security;

-- Public: read localizations for published posts only
create policy "Public read published localizations"
  on public.post_localizations for select
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and p.status = 'published'
        and (p.published_at is null or p.published_at <= now())
    )
  );

-- Team: full access
create policy "Team manage post_localizations"
  on public.post_localizations for all
  to authenticated
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  );
