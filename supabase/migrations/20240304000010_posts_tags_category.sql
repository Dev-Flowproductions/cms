-- Tags and category on posts for public filtering
alter table public.posts
  add column if not exists tags text[] default '{}',
  add column if not exists category text;

create index if not exists posts_tags_idx on public.posts using gin(tags);
create index if not exists posts_category_idx on public.posts(category);
