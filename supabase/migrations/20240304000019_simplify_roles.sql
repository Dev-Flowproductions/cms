-- Simplify roles to only admin and user
insert into public.roles (id) values ('user') on conflict do nothing;

-- Reassign all non-admin roles to user
update public.user_roles set role_id = 'user' where role_id in ('editor', 'reviewer', 'contributor');

-- Remove unused roles
delete from public.roles where id in ('editor', 'reviewer', 'contributor');
