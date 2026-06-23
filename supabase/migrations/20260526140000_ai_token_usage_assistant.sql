alter table public.ai_token_usage
  add column if not exists assistant text;

create index if not exists ai_token_usage_assistant_idx on public.ai_token_usage(assistant);
