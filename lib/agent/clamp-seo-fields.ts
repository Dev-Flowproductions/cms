/** Google SERP display limits we align to in UI and agent output. */
export const SEO_TITLE_MAX = 60;
export const META_DESCRIPTION_MAX = 160;

/** Truncate at word boundary when reasonable; otherwise hard cap. */
export function clampSeoTitle(s: string | null | undefined): string {
  if (s == null) return "";
  const t = s.trim();
  if (t.length <= SEO_TITLE_MAX) return t;
  const slice = t.slice(0, SEO_TITLE_MAX);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace >= Math.floor(SEO_TITLE_MAX * 0.55)) return slice.slice(0, lastSpace).trim();
  return slice.trim();
}

export function clampMetaDescription(s: string | null | undefined): string {
  if (s == null) return "";
  const t = s.trim();
  if (t.length <= META_DESCRIPTION_MAX) return t;
  const slice = t.slice(0, META_DESCRIPTION_MAX);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace >= Math.floor(META_DESCRIPTION_MAX * 0.65)) return slice.slice(0, lastSpace).trim();
  return slice.trim();
}
