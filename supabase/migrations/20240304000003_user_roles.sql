-- User roles (requires profiles and roles to exist)
create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id text not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

alter table public.user_roles enable row level security;

create policy "Admins can read user_roles"
  on public.user_roles for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role_id = 'admin'
    )
  );

create policy "Admins can insert user_roles"
  on public.user_roles for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role_id = 'admin'
    )
  );

create policy "Admins can update user_roles"
  on public.user_roles for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role_id = 'admin'
    )
  );

create policy "Admins can delete user_roles"
  on public.user_roles for delete
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role_id = 'admin'
    )
  );

-- Allow authenticated users to read their own roles (for requireTeamMember etc.)
create policy "Users can read own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());
