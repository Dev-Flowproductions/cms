-- Add AI/SEO fields to post_localizations
alter table public.post_localizations
  add column if not exists seo_title        text,
  add column if not exists seo_description  text,
  add column if not exists focus_keyword    text,
  add column if not exists faq_blocks       jsonb default '[]'::jsonb;

-- Agent runs table (tracks every AI generation)
create table if not exists public.agent_runs (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references public.posts(id) on delete cascade,
  locale       text,
  status       text not null default 'queued',
  model        text,
  input        jsonb,
  output       jsonb,
  cost_usd     numeric,
  error        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Agent tasks table (individual steps within a run)
create table if not exists public.agent_tasks (
  id           uuid primary key default gen_random_uuid(),
  run_id       uuid not null references public.agent_runs(id) on delete cascade,
  agent_name   text not null,
  status       text not null default 'queued',
  input        jsonb,
  output       jsonb,
  started_at   timestamptz,
  ended_at     timestamptz
);

alter table public.agent_runs enable row level security;
alter table public.agent_tasks enable row level security;

create policy "admins can manage agent_runs"
  on public.agent_runs for all
  using (current_user_has_role('admin'))
  with check (current_user_has_role('admin'));

create policy "admins can manage agent_tasks"
  on public.agent_tasks for all
  using (current_user_has_role('admin'))
  with check (current_user_has_role('admin'));
