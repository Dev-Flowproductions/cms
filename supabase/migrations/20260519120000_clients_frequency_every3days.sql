-- Allow posting every 3 days (scheduler interval + UI option).
alter table public.clients
  drop constraint if exists clients_frequency_check;

alter table public.clients
  add constraint clients_frequency_check
  check (frequency in ('daily', 'weekly', 'every3days', 'biweekly', 'monthly'));
