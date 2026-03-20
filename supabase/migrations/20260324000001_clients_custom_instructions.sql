-- Per-user instructions generated after onboarding; combined with general instructions when creating posts
alter table public.clients
  add column if not exists custom_instructions text;

comment on column public.clients.custom_instructions is 'Client-specific instructions (brand, voice, cover) generated after onboarding; used with general instructions for post generation.';
