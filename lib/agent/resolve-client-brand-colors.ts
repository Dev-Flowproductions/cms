/**
 * Resolves brand colours for covers and agent prompts per client.
 * Never uses the CMS platform defaults (#7c5cfc / #22d3a0) — those leaked onto every tenant.
 * Order: explicit client columns → hex codes in brand-book colour text → stable palette from domain seed.
 */

const HEX_IN_TEXT = /#[0-9a-fA-F]{3,8}\b/g;

/** Editorial pairs distinct from the platform accent colours; deterministic per domain. */
const SEED_PALETTES: ReadonlyArray<{
  primary: string;
  secondary: string;
  tertiary?: string;
}> = [
  { primary: "#1e3a5f", secondary: "#c45c26", tertiary: "#f4e8d8" },
  { primary: "#2d3436", secondary: "#00a896", tertiary: "#dfe6e9" },
  { primary: "#312e81", secondary: "#ea580c", tertiary: "#e0e7ff" },
  { primary: "#0f172a", secondary: "#0d9488", tertiary: "#cbd5e1" },
  { primary: "#14532d", secondary: "#ca8a04", tertiary: "#dcfce7" },
  { primary: "#422006", secondary: "#d97706", tertiary: "#fef3c7" },
  { primary: "#164e63", secondary: "#f472b6", tertiary: "#cffafe" },
  { primary: "#4c0519", secondary: "#be123c", tertiary: "#ffe4e6" },
  { primary: "#1c1917", secondary: "#78716c", tertiary: "#e7e5e4" },
  { primary: "#0c4a6e", secondary: "#f59e0b", tertiary: "#e0f2fe" },
];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function normalizeHex(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^#[0-9a-fA-F]{6}$/i.test(s)) return s.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/i.test(s)) {
    const r = s[1]!,
      g = s[2]!,
      b = s[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/i.test(s)) return `#${s.toLowerCase()}`;
  return null;
}

function extractHexesFromText(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  const found = text.match(HEX_IN_TEXT) ?? [];
  return found.map((h) => normalizeHex(h)).filter((h): h is string => !!h);
}

export type ResolvedClientBrandColors = {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string | null;
  alternativeColor: string | null;
};

/**
 * @param domain — used only for stable fallback palette (e.g. client.domain)
 */
export function resolveClientBrandColors(opts: {
  domain: string;
  primary_color?: string | null;
  secondary_color?: string | null;
  tertiary_color?: string | null;
  alternative_color?: string | null;
  colorPaletteText?: string | null;
}): ResolvedClientBrandColors {
  const explicit = [
    opts.primary_color,
    opts.secondary_color,
    opts.tertiary_color,
    opts.alternative_color,
  ]
    .map((c) => (c ? normalizeHex(c) : null))
    .filter((c): c is string => !!c);

  const fromBook = extractHexesFromText(opts.colorPaletteText);
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const h of [...explicit, ...fromBook]) {
    const k = h.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(h);
    }
  }

  const seed = opts.domain?.trim() || "default";
  const fallback = SEED_PALETTES[hashSeed(seed) % SEED_PALETTES.length]!;

  if (merged.length === 0) {
    return {
      primaryColor: fallback.primary,
      secondaryColor: fallback.secondary,
      tertiaryColor: fallback.tertiary ?? null,
      alternativeColor: null,
    };
  }

  return {
    primaryColor: merged[0]!,
    secondaryColor: merged[1] ?? merged[0]!,
    tertiaryColor: merged[2] ?? null,
    alternativeColor: merged[3] ?? null,
  };
}
