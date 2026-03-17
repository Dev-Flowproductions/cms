-- Store last scheduler generation error so we can debug when auto-publish runs fail
alter table public.clients
  add column if not exists last_generation_error text default null,
  add column if not exists last_generation_error_at timestamptz default null;

comment on column public.clients.last_generation_error
  is 'Error message from the last failed scheduler run (cleared on success)';
comment on column public.clients.last_generation_error_at
  is 'When the last generation error occurred';
