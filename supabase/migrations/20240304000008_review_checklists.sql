-- Review checklists
create table public.review_checklists (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  locale text check (locale in ('pt', 'en', 'fr')),
  items jsonb not null default '[]',
  status text not null default 'pending' check (status in ('pending', 'passed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, locale)
);

create index review_checklists_post_id_idx on public.review_checklists(post_id);

alter table public.review_checklists enable row level security;

-- Reviewers and admins can do everything; editors can read
create policy "Team read review_checklists"
  on public.review_checklists for select
  to authenticated
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  );

create policy "Reviewers manage review_checklists"
  on public.review_checklists for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role_id in ('admin', 'reviewer')
    )
  );

create policy "Reviewers update review_checklists"
  on public.review_checklists for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role_id in ('admin', 'reviewer')
    )
  );

create trigger review_checklists_updated_at
  before update on public.review_checklists
  for each row execute procedure public.set_updated_at();
