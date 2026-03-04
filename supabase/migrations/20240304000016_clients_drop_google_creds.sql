-- Drop per-client Google OAuth credential columns (replaced by shared OAuth app)
alter table public.clients
  drop column if exists google_client_id,
  drop column if exists google_client_secret;
