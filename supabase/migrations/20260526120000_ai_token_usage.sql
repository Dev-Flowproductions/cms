-- Track AI API token usage per client/post for admin cost monitoring
create table if not exists public.ai_token_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  operation text not null,
  provider text not null default 'openai',
  model text,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  total_tokens int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ai_token_usage_user_id_idx on public.ai_token_usage(user_id);
create index if not exists ai_token_usage_client_id_idx on public.ai_token_usage(client_id);
create index if not exists ai_token_usage_created_at_idx on public.ai_token_usage(created_at desc);
create index if not exists ai_token_usage_operation_idx on public.ai_token_usage(operation);

alter table public.ai_token_usage enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_token_usage' and policyname = 'Team read ai_token_usage'
  ) then
    create policy "Team read ai_token_usage"
      on public.ai_token_usage for select
      to authenticated
      using (
        exists (select 1 from public.user_roles ur where ur.user_id = auth.uid())
      );
  end if;
end $$;
