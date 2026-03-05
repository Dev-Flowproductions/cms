alter table public.clients
  add column if not exists webhook_url      text default null,
  add column if not exists webhook_secret   text default null,
  add column if not exists auto_publish     boolean not null default false;

alter table public.posts
  add column if not exists webhook_status   text default null,
  add column if not exists webhook_sent_at  timestamptz default null,
  add column if not exists webhook_error    text default null;

comment on column public.clients.webhook_url    is 'URL to POST published post data to';
comment on column public.clients.webhook_secret is 'Secret sent as x-webhook-secret header';
comment on column public.clients.auto_publish   is 'If true, push to webhook automatically on publish';
comment on column public.posts.webhook_status   is 'pending | success | failed';
comment on column public.posts.webhook_sent_at  is 'Timestamp of last webhook attempt';
comment on column public.posts.webhook_error    is 'Error message from last failed webhook attempt';
