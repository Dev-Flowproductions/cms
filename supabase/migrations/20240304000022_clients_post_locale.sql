-- Add post_locale so each client can choose which language their AI posts are generated in.
-- Defaults to 'en' (English). Valid values match the app's supported locales: en, pt, fr.

alter table public.clients
  add column if not exists post_locale text not null default 'en'
    check (post_locale in ('en', 'pt', 'fr'));

comment on column public.clients.post_locale
  is 'Language in which AI-generated blog posts are written for this client (en | pt | fr).';
