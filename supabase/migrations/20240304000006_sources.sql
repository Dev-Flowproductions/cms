-- Sources
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  publisher text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.sources enable row level security;

create policy "Team manage sources"
  on public.sources for all
  to authenticated
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  );
