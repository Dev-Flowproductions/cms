-- Optional alternative color for cover image background variety
alter table public.clients
  add column if not exists alternative_color text;

comment on column public.clients.alternative_color is 'Optional alternative color (hex) for cover backgrounds. AI picks primary, secondary, or alternative per image.';
