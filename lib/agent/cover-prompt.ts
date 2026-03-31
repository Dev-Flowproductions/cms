/**
 * Text prompt for **raster** cover generation (Gemini image model).
 * JSON post generation also has a `cover` chunk in `instruction-chunks.ts` for `cover_image_*` fields — keep both aligned on brand colours and English-on-image rules.
 */

/** Very long subjects can produce empty image parts from the image model — keep bounded. */
export const COVER_IMAGE_SUBJECT_MAX_CHARS = 2000;

export function truncateCoverImageSubject(subject: string): string {
  const s = subject.trim();
  if (s.length <= COVER_IMAGE_SUBJECT_MAX_CHARS) return s;
  return `${s.slice(0, COVER_IMAGE_SUBJECT_MAX_CHARS).trimEnd()}…`;
}

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

export type BuildCoverPromptOptions = {
  /**
   * When true, `headline` may be the localized article title — instruct the model to render
   * 2–4 words in English only on the image (do not copy non-English text).
   */
  headlineMayBeNonEnglish?: boolean;
};

/** Build the Imagen prompt for editorial blog cover. */
export function buildCoverPrompt(
  subject: string,
  headline: string,
  brandStyle: CoverBrandStyle,
  visualIdentity: CoverVisualIdentity,
  options?: BuildCoverPromptOptions
): string {
  const needsEnglishDerivation = options?.headlineMayBeNonEnglish === true;
  // European style: first letter caps, rest lowercase (sentence case) — for known-English headlines
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

  /** Covers are shared across locales — visible typography must stay English. */
  const englishOnlyRule =
    "ON-IMAGE TEXT LANGUAGE: Every letter and word shown on the image MUST be English only. " +
    "Do not render Portuguese, French, or any non-English language as readable text — even if the article topic is described in another language above.";

  const headlineInstruction = needsEnglishDerivation
    ? `${englishOnlyRule} ` +
      `Centered on-image headline: exactly ONE line, 2–4 words, ENGLISH ONLY (European sentence case: first letter caps, rest lowercase). ` +
      `The article title below may be in another language — do NOT copy it onto the image; invent a short natural English phrase that fits the topic. ` +
      `Topic / title reference: "${headlineForImage}". `
    : `${englishOnlyRule} ` +
      `Include this text ONCE only, centered: "${headlineForImage}". European style: first letter caps, rest lowercase. `;

  return (
    `Editorial blog hero graphic: ${subject}. ` +
    `Composition: ${variation} Wide banner 16:9. ` +
    brandStr +
    `Polished vector or editorial illustration feel; controlled depth (shadows, layers) allowed. Clean edges, high clarity. ` +
    headlineInstruction +
    `Text must be the TOP LAYER, centered; no shapes overlapping the text. Use the brand font/style. Bold editorial typography. No logos or brand names.`
  );
}
