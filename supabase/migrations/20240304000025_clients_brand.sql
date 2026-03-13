-- Add brand identity fields to clients table
alter table public.clients
  add column if not exists brand_name text,
  add column if not exists brand_tone text;

comment on column public.clients.brand_name is 'Proper brand name with correct capitalization (e.g., "Flow Productions" not "flowproductions")';
comment on column public.clients.brand_tone is 'Brand voice/tone description (e.g., "Professional, creative, forward-thinking")';
