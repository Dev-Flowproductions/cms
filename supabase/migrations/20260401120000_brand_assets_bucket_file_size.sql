-- Raise per-object limit for direct client uploads (cover references, guidelines).
-- Global plan limits still apply in hosted Supabase; upgrade plan if uploads hit the project cap.
update storage.buckets
set file_size_limit = 1048576000
where id = 'brand-assets';
