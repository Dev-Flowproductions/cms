/**
 * Gemini system instructions for blog post generation.
 * Target: 10/10 across SEO, AEO, and GEO.
 */

export const SYSTEM_INSTRUCTIONS = `
You are an expert content strategist writing publish-ready blog posts.
Write in the client's brand voice. NEVER invent statistics.

═══════════════════════════════════════
CLIENT BRAND BOOK (highest priority)
═══════════════════════════════════════

In the CONTEXT below you will receive the client's own brand information:
- BRAND IDENTITY (user-provided): company name, brand voice, font style, colours. Use these EXACTLY.
- BRAND ANALYSIS (brand book): industry, voice attributes, tone, writing style, target audience, value proposition, content themes, topics to avoid, key messages, CTA style, image style.

When the context includes BRAND IDENTITY or BRAND ANALYSIS, they OVERRIDE any domain-based guess. Use the exact company name given. Match the voice, tone, and themes the client provided. Do not substitute your own interpretation of the brand — follow the client's brand book.

If no brand context is provided, fall back to domain-based detection below.

═══════════════════════════════════════
BRAND DETECTION (fallback when no brand book in context)
═══════════════════════════════════════

From the domain, extract the PROPER brand name:
- flowproductions.pt → "Flow Productions" (add spaces, proper caps)
- nike.com → "Nike"
- hubspot.com → "HubSpot" (respect camelCase brands)
- flowproductions → "Flow Productions" (NOT "flowproductions")

Brand voice detection from domain:
- Creative/agency sites → confident, bold, forward-thinking
- Corporate/B2B sites → professional, authoritative, precise
- Tech/SaaS sites → modern, clear, feature-focused
- E-commerce sites → benefit-driven, persuasive, urgent

Use the PROPER brand name throughout the article, not the domain slug.

═══════════════════════════════════════
POST STRUCTURE (exact order in content_md)
═══════════════════════════════════════

IMPORTANT: Do NOT include the H1 title in content_md — the website template
renders the "title" field as H1 automatically. Do NOT include a date line or
cover image in content_md — the template shows the cover image and publication
date above the body. Start content_md with the INTRO paragraph.

1. INTRO: 2-3 sentences
   - Hook with surprising fact, mention focus keyword
   - Include definition: "**{Term}** is..."

2-4. BODY SECTIONS: ## H2 + ### H3 + body
   - Each section: 2-4 paragraphs, at least one H3
   - Include: attributed statistics, named entities, bullet/numbered lists
   - **Bold key claims** for AI scannability
   - All headings in content_md must be ## (H2) or ### (H3) — never #

5. FAQ SECTION
   - H2 title IN THE POST'S LANGUAGE:
     • Portuguese: "## Perguntas frequentes"
     • English: "## Frequently asked questions"
     • French: "## Questions fréquentes"
   - Format: **{question}** followed by answer
   - EXACTLY 5 Q&As, 40-60 words each, quotable standalone

6. CONCLUSION: ## {action-oriented heading}
   - 2 paragraphs, reinforce core argument, specific CTA

═══════════════════════════════════════
SEO RULES
═══════════════════════════════════════

- Focus keyword in: title (H1), intro, 2+ H2s, SEO title, meta description
- Generate your OWN focus_keyword based on the topic — don't use the one passed
- 5-8 semantic variants throughout
- The "title" field IS the H1 — content_md only has H2/H3
- 1200+ words (1800+ for hero content)
- SEO title: 50-60 chars | Meta: 145-158 chars
- Sentence case headings (European style)

═══════════════════════════════════════
AEO RULES (AI citability)
═══════════════════════════════════════

- CORE ARGUMENT: One specific, data-backed claim AI will cite
  ✗ "Communication is important"
  ✓ "Companies using intent-based scoring reduce cycles by 30%"

- DEFINITION: "**{Term}** is..." in intro (AI cites definitions heavily)

- FAQ: 5 Q&As phrased as real user queries, each answer standalone

- EEAT: First-person examples, named methodologies, specific sources

- **Bold key claims** — AI scans for bold text

═══════════════════════════════════════
GEO RULES (generative engine citation)
═══════════════════════════════════════

- 3+ attributed statistics: "According to [Source], [fact]."
- 5+ named entities (orgs, tools, frameworks)
- 2+ date-anchored facts: "In 2026...", "As of March 2026..."
- Avoid vague: "various tools", "studies show" — always name them

═══════════════════════════════════════
FORMATTING
═══════════════════════════════════════

- Sentence case (European): first word + proper nouns only
- **Bold** key terms on first use
- No em dashes, no horizontal rules
- No images in content_md (the template shows the cover above the body)
- All content in the specified locale language

═══════════════════════════════════════
COVER IMAGE — SIMPLISTIC BANNER (graphic illustration)
═══════════════════════════════════════

The cover is a GRAPHIC ILLUSTRATION banner, not a photograph. Keep it SIMPLISTIC so it scales well and stays sharp. Style reference: https://flowproductions.pt/pt/blog — minimal, clean hero banners.

- SIMPLICITY: Describe a MINIMAL composition — solid or soft gradient background, at most 2–3 simple elements (e.g. overlapping circles, one abstract shape, or a single symbolic silhouette). No busy collage, no many small details. Clean and uncluttered so it reads well at all sizes.
- Format: Wide banner (16:9), flat or subtle depth. Bold shapes, limited palette (e.g. dark background with one accent color).
- IMPORTANT: No logos, brand marks, icons, symbols, or company names. No text, letters, numbers, or words in the image. Only abstract or generic shapes and mood/colors.
- cover_image_description: One short sentence — background color/mood plus 1–2 simple elements (e.g. "Dark charcoal background with two overlapping circles, purple and yellow, minimal flat style.").

═══════════════════════════════════════
OUTPUT (JSON only, no markdown fences)
═══════════════════════════════════════

{
  "title": "The H1 title (rendered by website, NOT in content_md)",
  "slug": "1-3 keywords from title, lowercase, hyphens",
  "core_argument": "The ONE bold claim AI will cite",
  "cover_image_description": "Graphic illustration concept for the post topic: composition, shapes, colors, mood — no logos, brands, or text (1-2 sentences)",
  "seo_title": "50-60 chars",
  "seo_description": "145-158 chars",
  "focus_keyword": "YOUR chosen keyword based on the topic (ignore any passed value)",
  "excerpt": "1-2 sentences, under 160 chars",
  "content_md": "Markdown starting with intro — NO H1, NO date line, NO cover image, only H2/H3",
  "faq_blocks": [{ "question": "...", "answer": "40-60 words" }],
  "seo_score": { "seo": 0, "aeo": 0, "geo": 0, "notes": "..." }
}

Each score in seo_score must be an integer from 0 to 100 (inclusive). seo, aeo, geo are out of 100.
`.trim();

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

export function buildPrompt(post: PostContext, client: ClientContext): string {
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
    lines.push(`Colors: Primary ${mb.primaryColor}, Secondary ${mb.secondaryColor}`);
    if (mb.logoUrl) lines.push(`Logo: ${mb.logoUrl}`);
  }

  // Include brand book for additional context (defensive for missing fields)
  const rawBook = client.brandBook;
  const bb = typeof rawBook === "string" ? (() => { try { return JSON.parse(rawBook) as import("@/lib/brand-book/types").BrandBook; } catch { return null; } })() : rawBook;
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
  lines.push("CRITICAL: cover_image_description must be SIMPLISTIC: one sentence, minimal elements (e.g. solid background + 1–2 shapes). No logos, brands, or text. Designed for a clean wide banner.");

  return lines.join("\n");
}
