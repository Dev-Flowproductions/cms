-- Add headless blog integration fields (spec: Site entity)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS blog_base_path text NOT NULL DEFAULT '/blog',
  ADD COLUMN IF NOT EXISTS cms_api_key text;

COMMENT ON COLUMN public.clients.blog_base_path IS 'Base path for blog on the website, e.g. /blog';
COMMENT ON COLUMN public.clients.cms_api_key IS 'Server-to-server API key for content API; scoped to this client (site)';
