create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  domain      text not null,
  ga_api_key  text,
  gcc_api_key text,
  frequency   text not null default 'weekly'
              check (frequency in ('daily','weekly','biweekly','monthly')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.clients enable row level security;

-- Admins can do everything (uses SECURITY DEFINER helper to avoid recursion)
create policy "Admins can manage clients"
  on public.clients for all
  to authenticated
  using (public.current_user_has_role('admin'))
  with check (public.current_user_has_role('admin'));

-- Users can read their own client row
create policy "Users can read own client"
  on public.clients for select
  to authenticated
  using (user_id = auth.uid());

-- Users can update their own client row (frequency only; enforced at app layer)
create policy "Users can update own client"
  on public.clients for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
