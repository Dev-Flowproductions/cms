-- Track when the last auto-generated post was created for each client
alter table public.clients
  add column if not exists last_post_generated_at timestamptz default null;

comment on column public.clients.last_post_generated_at
  is 'Timestamp of last AI-generated post creation (used by the scheduler to determine next run)';
