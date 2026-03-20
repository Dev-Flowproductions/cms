-- User has finished onboarding; admin still needs to set webhook. Cleared when admin sets webhook.
alter table public.clients
  add column if not exists config_pending_admin boolean not null default false;

comment on column public.clients.config_pending_admin is 'True when user completed onboarding and is waiting for admin to set webhook. Set to false when admin configures webhook.';
