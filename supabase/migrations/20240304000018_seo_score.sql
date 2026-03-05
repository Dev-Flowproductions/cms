-- Add seo_score column to post_localizations to persist AI self-assessment scores
alter table public.post_localizations
  add column if not exists seo_score jsonb default null;

comment on column public.post_localizations.seo_score is
  'AI self-assessed scores: { seo: 0-10, aeo: 0-10, geo: 0-10, notes: string }';
