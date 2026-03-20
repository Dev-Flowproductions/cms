-- Author display on blog: add bio and job_title to profiles
alter table public.profiles
  add column if not exists bio text,
  add column if not exists job_title text;

comment on column public.profiles.bio is 'Short author bio shown on blog posts';
comment on column public.profiles.job_title is 'Author job title or role (e.g. "Content Lead")';
