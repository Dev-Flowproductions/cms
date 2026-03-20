-- Third brand color for clients (brand book / cover image palette)
alter table public.clients
  add column if not exists tertiary_color text;

comment on column public.clients.tertiary_color is 'Tertiary brand color (hex code) for palette and cover images';
