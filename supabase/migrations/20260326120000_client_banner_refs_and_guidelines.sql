-- Reference images for AI blog covers (Gemini multimodal) + optional brand guidelines document (text extracted on upload)

alter table public.clients
  add column if not exists cover_reference_image_1 text,
  add column if not exists cover_reference_image_2 text,
  add column if not exists cover_reference_image_3 text,
  add column if not exists brand_guidelines_storage_path text,
  add column if not exists brand_guidelines_text text;

comment on column public.clients.cover_reference_image_1 is 'Storage path in brand-assets bucket: company reference image for cover generation (slot 1).';
comment on column public.clients.cover_reference_image_2 is 'Storage path in brand-assets bucket: company reference image for cover generation (slot 2).';
comment on column public.clients.cover_reference_image_3 is 'Storage path in brand-assets bucket: company reference image for cover generation (slot 3).';
comment on column public.clients.brand_guidelines_storage_path is 'Storage path for uploaded guidelines file (PDF/txt/md).';
comment on column public.clients.brand_guidelines_text is 'Plain-text guidelines extracted on upload; injected into cover image prompts.';

insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

create policy "Users can upload own brand assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'brand-assets' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Public read brand assets"
on storage.objects for select
to public
using (bucket_id = 'brand-assets');

create policy "Users can update own brand assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'brand-assets' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own brand assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'brand-assets' and
  (storage.foldername(name))[1] = auth.uid()::text
);
