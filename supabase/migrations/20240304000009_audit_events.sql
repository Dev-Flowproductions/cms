-- Audit events (optional, for tracking publish/approve/reject)
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  payload jsonb default '{}',
  created_at timestamptz not null default now()
);

create index audit_events_post_id_idx on public.audit_events(post_id);
create index audit_events_created_at_idx on public.audit_events(created_at);

alter table public.audit_events enable row level security;

create policy "Team read audit_events"
  on public.audit_events for select
  to authenticated
  using (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  );

create policy "Team insert audit_events"
  on public.audit_events for insert
  to authenticated
  with check (
    exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
  );
