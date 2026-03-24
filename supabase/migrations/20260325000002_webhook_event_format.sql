-- Allow clients to use legacy webhook event type (cms.post.published) for backwards compatibility.
-- Default 'spec' uses post.published; 'legacy' uses cms.post.published (original scheduler format).
alter table public.clients
  add column if not exists webhook_event_format text default 'spec';

comment on column public.clients.webhook_event_format is
  'Webhook event format: spec = post.published (standard), legacy = cms.post.published (original scheduler format).';

-- Flow Productions was built for legacy format; set it for their domain.
update public.clients set webhook_event_format = 'legacy' where domain ilike '%flowproductions.pt%';
