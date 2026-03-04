-- Add per-client Google OAuth credentials (each client registers their own Google Cloud project)
alter table public.clients
  add column if not exists google_client_id     text,
  add column if not exists google_client_secret text;
