-- Optional byline personas per account: scheduled generation picks one at random per post.
create table public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  job_title text,
  bio text,
  avatar_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index blog_authors_user_id_idx on public.blog_authors (user_id);
create index blog_authors_user_sort_idx on public.blog_authors (user_id, sort_order, display_name);

alter table public.posts
  add column if not exists byline_author_id uuid references public.blog_authors (id) on delete set null;

comment on table public.blog_authors is 'Display authors for blog bylines; posts.byline_author_id picks one per generated post.';
comment on column public.posts.byline_author_id is 'Persona used for author block; null = use account profile.';

alter table public.blog_authors enable row level security;

create policy "Users manage own blog authors"
  on public.blog_authors
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public blog + embeds: allow reading personas that appear on published posts (no auth).
create policy "Public read blog authors on published posts"
  on public.blog_authors
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.byline_author_id = blog_authors.id
        and p.status = 'published'
    )
  );
