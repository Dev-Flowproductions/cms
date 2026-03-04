-- Citations
create table public.citations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  locale text not null check (locale in ('pt', 'en', 'fr')),
  quote text,
  claim text,
  section_anchor text,
  created_at timestamptz not null default now()
);

create index citations_post_id_idx on public.citations(post_id);

alter table public.citations enable row level security;

create policy "Team manage citations"
  on public.citations for all
  to authenticated
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  );
