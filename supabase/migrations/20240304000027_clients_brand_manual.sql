-- Add manual brand identity fields provided by user during onboarding
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text,
  ADD COLUMN IF NOT EXISTS font_style text,
  ADD COLUMN IF NOT EXISTS brand_voice text;

COMMENT ON COLUMN public.clients.company_name IS 'Official company name with proper capitalization';
COMMENT ON COLUMN public.clients.logo_url IS 'URL to uploaded company logo in Supabase storage';
COMMENT ON COLUMN public.clients.primary_color IS 'Primary brand color (hex code)';
COMMENT ON COLUMN public.clients.secondary_color IS 'Secondary brand color (hex code)';
COMMENT ON COLUMN public.clients.font_style IS 'Brand font style preference (e.g., Modern, Classic, Playful)';
COMMENT ON COLUMN public.clients.brand_voice IS 'Brand voice/tone description';
