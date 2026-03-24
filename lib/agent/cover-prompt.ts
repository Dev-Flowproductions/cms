/**
 * Shared cover image generation prompt.
 * Rules: primary color background only, elements on borders, text centered (European style: first letter caps, rest lowercase), brand font.
 * Composition varies per image (minimal, balanced, rich, structured, organic) for visual variety.
 */

const COMPOSITION_VARIATIONS = [
  "Minimal: 1–2 subtle accents only, spare corners. Very clean, lots of negative space.",
  "Balanced: 2–4 elements along borders. Mix of geometric and soft shapes. Moderate density.",
  "Rich: 4–6 layered elements near edges. More visual interest, still centre clear.",
  "Structured: Clear geometric frame or grid motifs on borders. Precise, editorial feel.",
  "Organic: 2–3 flowing soft shapes along edges. Less rigid, gentle curves.",
];

function pickCompositionVariation(): string {
  return COMPOSITION_VARIATIONS[Math.floor(Math.random() * COMPOSITION_VARIATIONS.length)] ?? COMPOSITION_VARIATIONS[1];
}

export type CoverBrandStyle = {
  primaryColor: string;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  fontStyle: string;
  brandVoice: string;
} | null;

export type CoverVisualIdentity = {
  colorPalette?: string;
  aestheticStyle?: string;
  imageStyle?: string;
} | null;

/** Build the Imagen prompt for editorial blog cover. */
export function buildCoverPrompt(
  subject: string,
  headline: string,
  brandStyle: CoverBrandStyle,
  visualIdentity: CoverVisualIdentity
): string {
  // European style: first letter caps, rest lowercase (sentence case)
  const t = headline.trim();
  const headlineForImage = t.length > 0 ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : t;

  const brandParts: string[] = [];

  if (brandStyle) {
    brandParts.push(
      `BACKGROUND: use ONLY the primary colour ${brandStyle.primaryColor} as the background — no gradients, no other colours for the background. ` +
      `All graphic elements must MATCH the post topic — thematic shapes and motifs that relate to the subject. Place elements along the BORDERS or edges — keep the center clear. ` +
      `Typography / font: ${brandStyle.fontStyle} style. Brand mood: ${brandStyle.brandVoice}.`
    );
    // Secondary/tertiary can be used for border elements only
    const accentColors = [brandStyle.secondaryColor, brandStyle.tertiaryColor].filter(Boolean);
    if (accentColors.length > 0) {
      brandParts.push(`Accent colours for border elements only: ${accentColors.join(", ")}.`);
    }
  } else if (visualIdentity) {
    if (visualIdentity.colorPalette) {
      brandParts.push(
        `Background: use only the first/primary colour from ${visualIdentity.colorPalette}. ` +
        `Elements on borders.`
      );
    }
    if (visualIdentity.aestheticStyle) brandParts.push(`Typography: ${visualIdentity.aestheticStyle}.`);
    if (visualIdentity.imageStyle) brandParts.push(visualIdentity.imageStyle);
  }

  const brandStr = brandParts.length > 0 ? brandParts.join(" ") + " " : "";
  const variation = pickCompositionVariation();

  return (
    `Editorial blog hero graphic: ${subject}. ` +
    `Composition: solid primary-colour background only. ${variation} Elements must MATCH the post topic — thematic shapes/motifs that relate to the subject (e.g. email → envelope; AI → circuits; branding → symbols). Place on BORDERS or edges only — centre must stay clear. Wide banner 16:9. ` +
    brandStr +
    `Flat or subtle depth, clean edges, high clarity. ` +
    `Include this text ONCE only, centered: "${headlineForImage}". European style: first letter caps, rest lowercase. ` +
    `Text must be the TOP LAYER, centered; no shapes overlapping the text. Use the brand font/style. Bold editorial typography. No logos or brand names.`
  );
}
