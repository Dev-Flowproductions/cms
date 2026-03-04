-- Storage bucket for cover images (run in Supabase SQL or use Dashboard to create bucket "covers" with public read)
-- Policy: authenticated users with role can upload/update/delete; public read for viewing published post covers
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "Authenticated can upload covers"
on storage.objects for insert
to authenticated
with check (bucket_id = 'covers');

create policy "Authenticated can update covers"
on storage.objects for update
to authenticated
using (bucket_id = 'covers');

create policy "Authenticated can delete covers"
on storage.objects for delete
to authenticated
using (bucket_id = 'covers');

create policy "Public can read covers"
on storage.objects for select
using (bucket_id = 'covers');
