-- Make domain nullable (set during onboarding, not at account creation)
alter table public.clients
  alter column domain drop not null;

-- Drop old API key columns (replaced by Google OAuth tokens)
alter table public.clients
  drop column if exists ga_api_key,
  drop column if exists gcc_api_key;

-- Add Google OAuth token columns
alter table public.clients
  add column if not exists google_access_token  text,
  add column if not exists google_refresh_token text,
  add column if not exists google_scope         text,
  add column if not exists google_connected_at  timestamptz;
