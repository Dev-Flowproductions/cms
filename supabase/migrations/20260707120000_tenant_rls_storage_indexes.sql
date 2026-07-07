-- Tenant-scoped RLS, covers storage policies, performance indexes, current_user_has_role helper

create or replace function public.current_user_has_role(p_role_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_id = p_role_id
  );
$$;

-- ── posts ────────────────────────────────────────────────────────────────────
drop policy if exists "Team manage posts" on public.posts;

create policy "Authors manage own posts"
  on public.posts for all
  to authenticated
  using (author_id = auth.uid() or public.current_user_has_role('admin'))
  with check (author_id = auth.uid() or public.current_user_has_role('admin'));

-- ── post_localizations ───────────────────────────────────────────────────────
drop policy if exists "Team manage post_localizations" on public.post_localizations;

create policy "Authors manage own post localizations"
  on public.post_localizations for all
  to authenticated
  using (
    public.current_user_has_role('admin')
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  )
  with check (
    public.current_user_has_role('admin')
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

-- ── sources ─────────────────────────────────────────────────────────────────
drop policy if exists "Team manage sources" on public.sources;

create policy "Users manage own sources"
  on public.sources for all
  to authenticated
  using (
    public.current_user_has_role('admin')
    or created_by = auth.uid()
    or created_by is null
  )
  with check (
    public.current_user_has_role('admin')
    or created_by = auth.uid()
  );

-- ── citations ───────────────────────────────────────────────────────────────
drop policy if exists "Team manage citations" on public.citations;

create policy "Authors manage citations on own posts"
  on public.citations for all
  to authenticated
  using (
    public.current_user_has_role('admin')
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  )
  with check (
    public.current_user_has_role('admin')
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

-- ── audit_events ────────────────────────────────────────────────────────────
drop policy if exists "Team insert audit_events" on public.audit_events;
drop policy if exists "Team read audit_events" on public.audit_events;

create policy "Authenticated insert audit_events"
  on public.audit_events for insert
  to authenticated
  with check (user_id = auth.uid() or public.current_user_has_role('admin'));

create policy "Admin read audit_events"
  on public.audit_events for select
  to authenticated
  using (public.current_user_has_role('admin'));

-- ── ai_token_usage ──────────────────────────────────────────────────────────
drop policy if exists "Team read ai_token_usage" on public.ai_token_usage;

create policy "Admin read ai_token_usage"
  on public.ai_token_usage for select
  to authenticated
  using (public.current_user_has_role('admin'));

-- ── review_checklists (replace broad team write) ─────────────────────────────
drop policy if exists "Team read review_checklists" on public.review_checklists;
drop policy if exists "Reviewers manage review_checklists" on public.review_checklists;
drop policy if exists "Reviewers update review_checklists" on public.review_checklists;

create policy "Admin manage review_checklists"
  on public.review_checklists for all
  to authenticated
  using (public.current_user_has_role('admin'))
  with check (public.current_user_has_role('admin'));

-- ── covers storage ───────────────────────────────────────────────────────────
drop policy if exists "Authenticated can upload covers" on storage.objects;
drop policy if exists "Authenticated can update covers" on storage.objects;
drop policy if exists "Authenticated can delete covers" on storage.objects;

create policy "Authors upload own post covers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'covers'
    and (
      public.current_user_has_role('admin')
      or exists (
        select 1 from public.posts p
        where p.id::text = (storage.foldername(name))[1]
          and p.author_id = auth.uid()
      )
    )
  );

create policy "Authors update own post covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'covers'
    and (
      public.current_user_has_role('admin')
      or exists (
        select 1 from public.posts p
        where p.id::text = (storage.foldername(name))[1]
          and p.author_id = auth.uid()
      )
    )
  );

create policy "Authors delete own post covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'covers'
    and (
      public.current_user_has_role('admin')
      or exists (
        select 1 from public.posts p
        where p.id::text = (storage.foldername(name))[1]
          and p.author_id = auth.uid()
      )
    )
  );

-- ── indexes ─────────────────────────────────────────────────────────────────
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_updated_at_idx on public.posts(updated_at desc);
create index if not exists posts_author_status_idx on public.posts(author_id, status);
create index if not exists clients_user_id_idx on public.clients(user_id);

-- Aggregated post counts for admin user list (service role / admin UI)
create or replace function public.admin_users_with_post_count()
returns table (user_id uuid, post_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select author_id as user_id, count(*)::bigint as post_count
  from public.posts
  group by author_id;
$$;

revoke all on function public.admin_users_with_post_count() from public;
revoke all on function public.admin_users_with_post_count() from anon;
revoke all on function public.admin_users_with_post_count() from authenticated;
grant execute on function public.admin_users_with_post_count() to service_role;
