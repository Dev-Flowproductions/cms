/**
 * Detects when client instructions forbid on-image typography on blog covers.
 * Used to override default CMS cover/headline rules (embedding + buildCoverPrompt).
 */

const NO_TEXT_ON_COVER_PATTERNS: RegExp[] = [
  /\bno\s+text\s+on\s+(?:top\s+of\s+)?(?:the\s+)?(?:generated\s+)?images?\b/i,
  /\bno\s+text\s+on\s+(?:top\s+of\s+)?(?:the\s+)?(?:cover|banner|hero)\b/i,
  /\b(?:don'?t|do\s+not)\s+(?:write|put|add|include|render)\s+text\s+on\s+(?:top\s+of\s+)?(?:the\s+)?images?\b/i,
  /\b(?:don'?t|do\s+not)\s+(?:write|put|add|include|render)\s+(?:any\s+)?(?:on-?image\s+)?text\b/i,
  /\bno\s+on-?image\s+text\b/i,
  /\bwithout\s+(?:any\s+)?(?:on-?image\s+)?text\b/i,
  /\btext-?free\s+(?:cover|banner|image)\b/i,
  /\bno\s+(?:headline|typography|lettering)\s+on\s+(?:the\s+)?(?:cover|banner|image)\b/i,
];

export const NO_COVER_ON_IMAGE_TEXT_OVERRIDE =
  "CLIENT COVER TEXT POLICY (overrides default CMS headline rules — obey absolutely):\n" +
  "Do NOT render any letters, words, headlines, typography, labels, captions, or readable text on the cover image.\n" +
  "Pure visual composition only; keep the center clear. No logos or brand names as text.";

export function clientDisallowsCoverOnImageText(
  combinedInstructions: string | null | undefined,
): boolean {
  const text = combinedInstructions?.trim();
  if (!text) return false;
  return NO_TEXT_ON_COVER_PATTERNS.some((re) => re.test(text));
}
