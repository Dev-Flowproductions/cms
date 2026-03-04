-- Roles (seed data)
create table public.roles (
  id text primary key
);

insert into public.roles (id) values
  ('admin'),
  ('editor'),
  ('reviewer'),
  ('contributor');

alter table public.roles enable row level security;

create policy "Authenticated can read roles"
  on public.roles for select
  to authenticated
  using (true);
