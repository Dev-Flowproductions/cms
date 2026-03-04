-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'idea',
  content_type text not null default 'hero' check (content_type in ('hero', 'hub', 'hygiene')),
  primary_locale text not null default 'en' check (primary_locale in ('pt', 'en', 'fr')),
  author_id uuid not null references public.profiles(id) on delete restrict,
  cover_image_path text,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_slug_idx on public.posts(slug);
create index posts_status_idx on public.posts(status);
create index posts_published_at_idx on public.posts(published_at) where published_at is not null;

alter table public.posts enable row level security;

-- Public: read published posts only
create policy "Public read published posts"
  on public.posts for select
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
  );

-- Team (any user with a role): full access
create policy "Team manage posts"
  on public.posts for all
  to authenticated
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  );

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();
