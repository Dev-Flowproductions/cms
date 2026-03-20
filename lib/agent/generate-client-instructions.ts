/**
 * Generates CLIENT-SPECIFIC INSTRUCTIONS from onboarding/client data.
 * Stored in clients.custom_instructions and combined with general instructions when creating posts.
 */

import type { BrandBook } from "@/lib/brand-book/types";

export type ClientRowForInstructions = {
  domain: string | null;
  company_name: string | null;
  brand_name: string | null;
  brand_tone: string | null;
  brand_book: unknown;
  primary_color: string | null;
  secondary_color: string | null;
  tertiary_color: string | null;
  font_style: string | null;
  brand_voice: string | null;
  logo_url: string | null;
};

/**
 * Build the client-specific instructions document from client data.
 * Used when onboarding is complete (and when admin updates user) and stored in clients.custom_instructions.
 */
export function generateClientSpecificInstructions(client: ClientRowForInstructions): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════════════");
  lines.push("CLIENT-SPECIFIC INSTRUCTIONS (follow exactly)");
  lines.push("═══════════════════════════════════════");
  lines.push("");

  const hasManual =
    client.company_name?.trim() ||
    client.primary_color ||
    client.secondary_color ||
    client.tertiary_color ||
    client.font_style ||
    client.brand_voice;

  if (hasManual) {
    lines.push("BRAND IDENTITY (user-provided — use these EXACTLY)");
    lines.push("─────────────────────────────────────");
    if (client.company_name?.trim()) {
      lines.push(`Company name: ${client.company_name.trim()} (use this exact name everywhere)`);
    }
    if (client.brand_voice?.trim()) lines.push(`Brand voice: ${client.brand_voice.trim()} (match this tone)`);
    if (client.font_style?.trim()) lines.push(`Font style: ${client.font_style.trim()}`);
    if (client.primary_color || client.secondary_color || client.tertiary_color) {
      const parts = ["Primary " + (client.primary_color ?? "—"), "Secondary " + (client.secondary_color ?? "—"), "Tertiary " + (client.tertiary_color ?? "—")];
      lines.push(`Colors: ${parts.join(", ")}`);
    }
    if (client.logo_url?.trim()) lines.push(`Logo: ${client.logo_url.trim()}`);
    lines.push("");
  }

  const rawBook = client.brand_book;
  const bb: BrandBook | null =
    typeof rawBook === "string"
      ? (() => {
          try {
            return JSON.parse(rawBook) as BrandBook;
          } catch {
            return null;
          }
        })()
      : (rawBook as BrandBook | null);

  if (bb && typeof bb === "object") {
    if (bb.visualIdentity || hasManual) {
      lines.push("BRAND VISUAL — COVER IMAGE (use these EXACTLY for cover_image_description)");
      lines.push("─────────────────────────────────────");
      if (hasManual) {
        const parts = ["Primary " + (client.primary_color ?? "—"), "Secondary " + (client.secondary_color ?? "—"), "Tertiary " + (client.tertiary_color ?? "—")];
        lines.push(`Cover colours: ${parts.join(", ")}`);
        lines.push(`Cover typography / font style: ${client.font_style ?? "modern"}`);
        lines.push(`Cover brand voice / mood: ${client.brand_voice ?? "professional"}`);
      } else if (bb.visualIdentity) {
        lines.push(`Cover colour palette: ${bb.visualIdentity.colorPalette}`);
        lines.push(`Cover aesthetic / typography: ${bb.visualIdentity.aestheticStyle}`);
        lines.push(`Cover image style: ${bb.visualIdentity.imageStyle}`);
        if (Array.isArray(bb.voiceAttributes) && bb.voiceAttributes.length > 0) {
          lines.push(`Cover brand voice / mood: ${bb.voiceAttributes.join(", ")}`);
        }
      }
      lines.push("");
    }

    lines.push("BRAND ANALYSIS (follow this context)");
    lines.push("─────────────────────────────────────");
    if (!hasManual && bb.brandName) lines.push(`Brand name: ${bb.brandName} (use this exact name)`);
    if (bb.tagline) lines.push(`Tagline: ${bb.tagline}`);
    if (bb.industry || bb.niche) lines.push(`Industry: ${bb.industry ?? ""} / ${bb.niche ?? ""}`);
    if (Array.isArray(bb.voiceAttributes) && bb.voiceAttributes.length > 0) {
      lines.push(`Voice: ${bb.voiceAttributes.join(", ")}`);
    }
    if (bb.toneDescription) lines.push(`Tone: ${bb.toneDescription}`);
    if (bb.writingStyle) lines.push(`Writing style: ${bb.writingStyle}`);
    if (bb.targetAudience?.primary) lines.push(`Target audience: ${bb.targetAudience.primary}`);
    if (bb.uniqueValueProposition) lines.push(`Value proposition: ${bb.uniqueValueProposition}`);
    if (bb.marketPosition) lines.push(`Market position: ${bb.marketPosition}`);
    if (Array.isArray(bb.contentThemes) && bb.contentThemes.length > 0) {
      lines.push(`Content themes: ${bb.contentThemes.join(", ")}`);
    }
    if (Array.isArray(bb.topicsToAvoid) && bb.topicsToAvoid.length > 0) {
      lines.push(`Topics to AVOID: ${bb.topicsToAvoid.join(", ")}`);
    }
    if (Array.isArray(bb.keyMessages) && bb.keyMessages.length > 0) {
      lines.push(`Key messages: ${bb.keyMessages.slice(0, 3).join("; ")}`);
    }
    if (bb.contentGuidelines?.callToActionStyle) {
      lines.push(`CTA style: ${bb.contentGuidelines.callToActionStyle}`);
    }
    if (bb.visualIdentity?.imageStyle) {
      lines.push(`Image style: ${bb.visualIdentity.imageStyle}`);
    }
    lines.push("");
  } else if (!hasManual && (client.brand_name?.trim() || client.brand_tone?.trim())) {
    lines.push("BRAND (fallback)");
    lines.push("─────────────────────────────────────");
    if (client.brand_name?.trim()) lines.push(`Brand name: ${client.brand_name.trim()} (use this exact name)`);
    if (client.brand_tone?.trim()) lines.push(`Brand tone: ${client.brand_tone.trim()}`);
    lines.push("");
  }

  if (client.domain?.trim()) {
    lines.push("WEBSITE");
    lines.push("─────────────────────────────────────");
    lines.push(`Domain: ${client.domain.trim()}`);
    lines.push("");
    lines.push("If no brand name is set above, derive a proper brand name from the domain (e.g. flowproductions.pt → \"Flow Productions\"). Use that name throughout the article.");
  }

  return lines.join("\n").trim();
}
