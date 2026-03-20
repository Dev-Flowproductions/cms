-- Site pages for internal linking in generated posts (at least one link per post)
alter table public.clients
  add column if not exists internal_links jsonb default '[]'::jsonb;

comment on column public.clients.internal_links is 'Array of { "url": "...", "label": "..." } for pages on the client site; AI includes at least one contextual link per post.';
