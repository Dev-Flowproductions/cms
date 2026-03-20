/**
 * Gemini system instructions for blog post generation.
 * Uses general instructions + per-user CLIENT-SPECIFIC INSTRUCTIONS (generated after onboarding).
 */

import { SYSTEM_INSTRUCTIONS_GENERAL } from "./instructions-general";

/** Combined system instructions: general + client-specific (when provided). */
export function getSystemInstructions(clientSpecificInstructions: string | null): string {
  const base = SYSTEM_INSTRUCTIONS_GENERAL;
  if (!clientSpecificInstructions?.trim()) return base;
  return `${base}\n\n${clientSpecificInstructions.trim()}`;
}

/** @deprecated Use getSystemInstructions(client.custom_instructions) for new code. */
export const SYSTEM_INSTRUCTIONS = SYSTEM_INSTRUCTIONS_GENERAL;

// ─── Context builders ──────────────────────────────────────────────────────

import type { BrandBook, ManualBrandInfo } from "@/lib/brand-book/types";

export type ClientContext = {
  domain: string | null;
  brandName?: string | null;
  brandTone?: string | null;
  brandBook?: BrandBook | null;
  manualBrand?: ManualBrandInfo | null;
  websiteSummary?: string | null;
  industry?: string | null;
  gaTopPages?: string[] | null;
  gaTopKeywords?: string[] | null;
  searchConsoleQueries?: string[] | null;
  /** Recent post titles for this client (scheduler only) — model must choose a different topic */
  recentPostTitles?: string[] | null;
};

export type PostContext = {
  slug: string;
  content_type: string;
  locale: string;
  focus_keyword: string;
  publication_date: string;
  existing_title?: string | null;
  existing_draft?: string | null;
};

const CONTENT_TYPE_GUIDE: Record<string, string> = {
  hero: "1800-2500 words, comprehensive, 3+ statistics",
  hub: "1000-1400 words, focused sub-topic, 2+ statistics",
  hygiene: "600-900 words, FAQ/how-to, snippet-optimised",
};

export type BuildPromptOptions = {
  /** When true, brand identity/visual/analysis are in system (client-specific instructions); do not duplicate in prompt. */
  hasCustomInstructions?: boolean;
};

export function buildPrompt(post: PostContext, client: ClientContext, options?: BuildPromptOptions): string {
  const hasCustomInstructions = options?.hasCustomInstructions === true;
  const lines: string[] = [];
  const now = new Date();
  const currentDate = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  lines.push("TASK: Generate ONE blog post as a single JSON object. You MUST follow the system instructions (structure, SEO, AEO, GEO, formatting, output schema) and the brand context below. Use the exact company name and voice given. Output ONLY valid JSON, no markdown fences.");
  lines.push("");
  lines.push("═══════════════════════════════");
  lines.push("CONTEXT");
  lines.push("═══════════════════════════════");
  lines.push(`Today: ${currentDate}`);
  lines.push(`Language: ${post.locale}`);
  lines.push(`Content type: ${post.content_type} — ${CONTENT_TYPE_GUIDE[post.content_type] ?? "standard"}`);
  lines.push(`Publication date: ${post.publication_date}`);

  if (client.domain) lines.push(`Website: ${client.domain}`);

  // Brand blocks only when NOT using client-specific system instructions (so legacy / no custom_instructions still get brand in prompt)
  if (!hasCustomInstructions) {
    // Include manual brand identity (user-provided, highest priority)
    if (client.manualBrand) {
      const mb = client.manualBrand;
      lines.push("");
      lines.push("═══════════════════════════════");
      lines.push("BRAND IDENTITY (user-provided — FOLLOW EXACTLY)");
      lines.push("═══════════════════════════════");
      lines.push(`Company name: ${mb.companyName} (use this exact name everywhere)`);
      lines.push(`Brand voice: ${mb.brandVoice} (match this tone)`);
      lines.push(`Font style: ${mb.fontStyle}`);
      const colorParts = [`Primary ${mb.primaryColor}`, `Secondary ${mb.secondaryColor}`];
      if (mb.tertiaryColor) colorParts.push(`Tertiary ${mb.tertiaryColor}`);
      lines.push(`Colors: ${colorParts.join(", ")}`);
      if (mb.logoUrl) lines.push(`Logo: ${mb.logoUrl}`);
    }

    // BRAND VISUAL — COVER IMAGE: exact variables for cover image (colours, font, voice)
    const rawBook = client.brandBook;
    const bb = typeof rawBook === "string" ? (() => { try { return JSON.parse(rawBook) as import("@/lib/brand-book/types").BrandBook; } catch { return null; } })() : rawBook;
    if (client.manualBrand || (bb && bb.visualIdentity)) {
      lines.push("");
      lines.push("═══════════════════════════════");
      lines.push("BRAND VISUAL — COVER IMAGE (use these EXACTLY for cover_image_description)");
      lines.push("═══════════════════════════════");
      if (client.manualBrand) {
        const mb = client.manualBrand;
        const coverParts = [`Primary ${mb.primaryColor}`, `Secondary ${mb.secondaryColor}`];
        if (mb.tertiaryColor) coverParts.push(`Tertiary ${mb.tertiaryColor}`);
        lines.push(`Cover colours: ${coverParts.join(", ")} (use these exact hex/brand colours for background and accents)`);
        lines.push(`Cover typography / font style: ${mb.fontStyle}`);
        lines.push(`Cover brand voice / mood: ${mb.brandVoice}`);
      } else if (bb?.visualIdentity) {
        lines.push(`Cover colour palette: ${bb.visualIdentity.colorPalette}`);
        lines.push(`Cover aesthetic / typography: ${bb.visualIdentity.aestheticStyle}`);
        lines.push(`Cover image style: ${bb.visualIdentity.imageStyle}`);
        if (Array.isArray(bb.voiceAttributes) && bb.voiceAttributes.length > 0) {
          lines.push(`Cover brand voice / mood: ${bb.voiceAttributes.join(", ")}`);
        }
      }
    }

    // Include brand book for additional context (defensive for missing fields)
    if (bb && typeof bb === "object") {
      lines.push("");
      lines.push("═══════════════════════════════");
      lines.push("BRAND ANALYSIS (follow this context)");
      lines.push("═══════════════════════════════");
      if (!client.manualBrand && bb.brandName) {
        lines.push(`Brand name: ${bb.brandName} (use this exact name)`);
      }
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
    } else if (!client.manualBrand) {
      // Fallback to simple brand info
      if (client.brandName) {
        lines.push(`Brand name: ${client.brandName} (use this exact name, not the domain)`);
      }
      if (client.brandTone) lines.push(`Brand tone: ${client.brandTone}`);
      if (client.industry) lines.push(`Industry: ${client.industry}`);
    }
  }

  if (client.gaTopPages?.length) {
    lines.push(`\nTop pages (build on these):`);
    client.gaTopPages.slice(0, 5).forEach((p) => lines.push(`  - ${p}`));
  }

  if (client.gaTopKeywords?.length) {
    lines.push(`\nTop keywords (use as variants):`);
    client.gaTopKeywords.slice(0, 8).forEach((k) => lines.push(`  - ${k}`));
  }

  if (client.searchConsoleQueries?.length) {
    lines.push(`\nSearch queries (use for topic + FAQ):`);
    client.searchConsoleQueries.slice(0, 8).forEach((q) => lines.push(`  - ${q}`));
  }

  if (client.recentPostTitles?.length) {
    lines.push("");
    lines.push("═══════════════════════════════");
    lines.push("RECENT ARTICLES — CHOOSE A DIFFERENT TOPIC");
    lines.push("═══════════════════════════════");
    lines.push("The client already has these posts. Generate a NEW article on a completely different topic or angle. Do NOT repeat or closely mimic these titles or subjects:");
    client.recentPostTitles.slice(0, 10).forEach((title) => lines.push(`  - ${title}`));
  }

  lines.push("");
  lines.push("═══════════════════════════════");
  lines.push("CHECKLIST");
  lines.push("═══════════════════════════════");
  lines.push("SEO: keyword in title/intro/H2s/seo_title/meta, 5-8 variants, sentence case");
  lines.push("AEO: core argument, definition block, 5 FAQs, bold claims, EEAT signals");
  lines.push("GEO: 3+ attributed stats, 5+ named entities, date-anchored facts");
  if (client.recentPostTitles?.length) {
    lines.push("CRITICAL: Choose a completely different topic and angle from the RECENT ARTICLES listed above — do not repeat those titles or subjects.");
  }
  lines.push("CRITICAL: content_md has NO H1, NO date line, NO cover image — only H2/H3. Start with the intro paragraph.");
  lines.push("CRITICAL: Do NOT add internal links or a trailing learn more line in content_md — those are added automatically after generation.");
  lines.push("CRITICAL: cover_image_description = BALANCED editorial composition (2–4 elements, like Flow blog). Use the EXACT colours, font style, and brand voice from BRAND VISUAL — COVER IMAGE above. Cover MUST show a SHORT headline (2–4 words) IN ENGLISH (use cover_image_headline). No logos or brand names.");

  return lines.join("\n");
}
