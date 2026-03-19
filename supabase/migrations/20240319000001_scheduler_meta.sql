-- Rate-limit for traffic-based scheduler trigger (no cron): last time we triggered a run
create table if not exists public.scheduler_meta (
  id int primary key default 1,
  last_trigger_at timestamptz,
  constraint single_row check (id = 1)
);

insert into public.scheduler_meta (id, last_trigger_at)
values (1, null)
on conflict (id) do nothing;

comment on table public.scheduler_meta is 'Single row: last time the scheduler was triggered (for rate-limiting traffic-based runs)';
