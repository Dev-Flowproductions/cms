-- DG ↔ AI CMS: persist brief intake, idempotency, and outbound webhook diagnostics.
-- See docs/00_shared_integration_contract_dg_ai_cms.md

create table public.dg_integration_records (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  dg_workspace_id text,
  dg_client_id text,
  dg_project_id text not null,
  dg_strategy_id text not null,
  dg_campaign_id text,
  cms_site_id uuid not null references public.clients (id) on delete cascade,
  post_id uuid references public.posts (id) on delete set null,
  brief_title text,
  brief_md text not null,
  language text not null,
  primary_keyword text,
  dg_payload jsonb,
  last_canonical_status text,
  last_webhook_event_id uuid,
  last_webhook_sent_at timestamptz,
  last_webhook_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dg_integration_records_post_id_idx on public.dg_integration_records (post_id);
create index dg_integration_records_cms_site_id_idx on public.dg_integration_records (cms_site_id);

comment on table public.dg_integration_records is 'DG brief intake and CMS→DG webhook bookkeeping; cms_site_id references clients.id.';

create trigger dg_integration_records_updated_at
  before update on public.dg_integration_records
  for each row execute procedure public.set_updated_at();

alter table public.dg_integration_records enable row level security;
