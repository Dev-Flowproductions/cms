/**
 * Shared cover image generation prompt.
 * Rules: primary color background only, elements on borders, text centered (European style: first letter caps, rest lowercase), brand font.
 * Composition varies per image (minimal, balanced, rich, structured, organic) for visual variety.
 */

const COMPOSITION_VARIATIONS = [
  "Balanced editorial: clear thematic imagery tied to the article — metaphors, symbols, or abstract shapes with depth and layering. Professional polish, not empty.",
  "Rich illustration: 4–6 cohesive visual elements suggesting the topic; readable hierarchy; avoid generic stock clichés.",
  "Structured hero: strong visual band or shape behind the headline area, secondary motifs in corners that echo the subject.",
  "Asymmetric layout: bold graphic forms on one side, complementary detail opposite; topic-specific, not decorative noise.",
  "Metaphor-led: one main visual concept (scene or object cluster) that clearly evokes the post theme; crisp edges, high clarity.",
];

function pickCompositionVariation(): string {
  return COMPOSITION_VARIATIONS[Math.floor(Math.random() * COMPOSITION_VARIATIONS.length)] ?? COMPOSITION_VARIATIONS[1];
}

/** Pick one of the available colors for background to add variety across covers. */
function pickBackgroundColor(style: NonNullable<CoverBrandStyle>): string {
  const options: string[] = [style.primaryColor];
  if (style.secondaryColor) options.push(style.secondaryColor);
  if (style.alternativeColor) options.push(style.alternativeColor);
  return options[Math.floor(Math.random() * options.length)] ?? style.primaryColor;
}

/** Colors for accent elements (excluding the chosen background). */
function getAccentColors(style: NonNullable<CoverBrandStyle>, backgroundColor: string): string[] {
  const all = [style.primaryColor, style.secondaryColor, style.tertiaryColor, style.alternativeColor].filter(Boolean) as string[];
  return all.filter((c) => c.toLowerCase() !== backgroundColor.toLowerCase());
}

export type CoverBrandStyle = {
  primaryColor: string;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  alternativeColor?: string | null;
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
    const backgroundColor = pickBackgroundColor(brandStyle);
    const accentColors = getAccentColors(brandStyle, backgroundColor);
    // Client font_style is the baseline; brand book visualIdentity adds typography / art direction (often richer).
    const typoFromBook = visualIdentity?.aestheticStyle?.trim();
    const typoLine = typoFromBook
      ? `Typography: match "${brandStyle.fontStyle}" as baseline AND follow brand book direction: ${typoFromBook}`
      : `Typography / font feel: ${brandStyle.fontStyle}`;
    const imageDir = visualIdentity?.imageStyle?.trim();
    const imageLine = imageDir ? ` Illustration / image style from brand book: ${imageDir}.` : "";
    brandParts.push(
      `COLOUR SYSTEM: base background ${backgroundColor} (solid or very subtle edge vignette only — no loud rainbow gradients). ` +
      `Build a substantive, topic-driven graphic: use accent colours ${accentColors.slice(0, 3).join(", ") || "from the same palette"} for illustrations, shapes, and depth. ` +
      `${typoLine}. Brand mood: ${brandStyle.brandVoice}.${imageLine} ` +
      `Do not use any other platform or agency palette — only these client colours and neutrals (white/black at low opacity) for contrast.`
    );
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
    `Composition: ${variation} Wide banner 16:9. ` +
    brandStr +
    `Polished vector or editorial illustration feel; controlled depth (shadows, layers) allowed. Clean edges, high clarity. ` +
    `Include this text ONCE only, centered: "${headlineForImage}". European style: first letter caps, rest lowercase. ` +
    `Text must be the TOP LAYER, centered; no shapes overlapping the text. Use the brand font/style. Bold editorial typography. No logos or brand names.`
  );
}
