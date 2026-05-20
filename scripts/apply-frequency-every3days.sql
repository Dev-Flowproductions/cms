-- Run once in Supabase Dashboard → SQL Editor (fixes clients_frequency_check for every3days).
alter table public.clients
  drop constraint if exists clients_frequency_check;

alter table public.clients
  add constraint clients_frequency_check
  check (frequency in ('daily', 'weekly', 'every3days', 'biweekly', 'monthly'));
