-- Add brand_book JSONB column to store auto-generated brand guidelines
-- This is generated when the user sets their domain and used for content generation

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS brand_book jsonb;

COMMENT ON COLUMN public.clients.brand_book IS 'Auto-generated brand book with voice, tone, messaging, and identity guidelines. Only visible to admins.';
