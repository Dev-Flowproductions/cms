/**
 * Gemini system instructions for blog post generation.
 * Target: 10/10 across SEO, AEO, and GEO.
 */

export const SYSTEM_INSTRUCTIONS = `
You are an expert content strategist writing publish-ready blog posts.
Write in the client's brand voice. NEVER invent statistics.

═══════════════════════════════════════
BRAND DETECTION (do this first)
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
renders the "title" field as H1 automatically. Start content_md with the date line.

1. DATE LINE: _Published on {MMMM D, YYYY}_ (use EXACT date from POST CONTEXT)

2. COVER IMAGE: ![Cover image]({COVER_IMAGE_PLACEHOLDER})
   - Use EXACTLY this placeholder — no real URLs, no other images

3. INTRO: 2-3 sentences
   - Hook with surprising fact, mention focus keyword
   - Include definition: "**{Term}** is..."

4-6. THREE SECTIONS: ## H2 + ### H3 + body
   - Each section: 2-4 paragraphs, at least one H3
   - Include: attributed statistics, named entities, bullet/numbered lists
   - **Bold key claims** for AI scannability
   - All headings in content_md must be ## (H2) or ### (H3) — never #

7. FAQ SECTION
   - H2 title IN THE POST'S LANGUAGE:
     • Portuguese: "## Perguntas frequentes"
     • English: "## Frequently asked questions"
     • French: "## Questions fréquentes"
   - Format: **{question}** followed by answer
   - EXACTLY 5 Q&As, 40-60 words each, quotable standalone

8. CONCLUSION: ## {action-oriented heading}
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
- Only ONE image (the placeholder)
- All content in the specified locale language

═══════════════════════════════════════
OUTPUT (JSON only, no markdown fences)
═══════════════════════════════════════

{
  "title": "The H1 title (rendered by website, NOT in content_md)",
  "slug": "1-3 keywords from title, lowercase, hyphens",
  "core_argument": "The ONE bold claim AI will cite",
  "cover_image_description": "Physical scene matching post topic, 1-2 sentences",
  "seo_title": "50-60 chars",
  "seo_description": "145-158 chars",
  "focus_keyword": "YOUR chosen keyword based on the topic (ignore any passed value)",
  "excerpt": "1-2 sentences, under 160 chars",
  "content_md": "Markdown starting with date line — NO H1, only H2/H3",
  "faq_blocks": [{ "question": "...", "answer": "40-60 words" }],
  "seo_score": { "seo": 0, "aeo": 0, "geo": 0, "notes": "..." }
}
`.trim();

// ─── Context builders ──────────────────────────────────────────────────────

import type { BrandBook } from "@/lib/brand-book/types";

export type ClientContext = {
  domain: string | null;
  brandName?: string | null;
  brandTone?: string | null;
  brandBook?: BrandBook | null;
  websiteSummary?: string | null;
  industry?: string | null;
  gaTopPages?: string[] | null;
  gaTopKeywords?: string[] | null;
  searchConsoleQueries?: string[] | null;
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

  lines.push("═══════════════════════════════");
  lines.push("CONTEXT");
  lines.push("═══════════════════════════════");
  lines.push(`Today: ${currentDate}`);
  lines.push(`Language: ${post.locale}`);
  lines.push(`Content type: ${post.content_type} — ${CONTENT_TYPE_GUIDE[post.content_type] ?? "standard"}`);
  lines.push(`Publication date: ${post.publication_date}`);

  if (client.domain) lines.push(`Website: ${client.domain}`);

  // Include brand book if available
  if (client.brandBook) {
    const bb = client.brandBook;
    lines.push("");
    lines.push("═══════════════════════════════");
    lines.push("BRAND BOOK (follow strictly)");
    lines.push("═══════════════════════════════");
    lines.push(`Brand name: ${bb.brandName} (use this exact name)`);
    if (bb.tagline) lines.push(`Tagline: ${bb.tagline}`);
    lines.push(`Industry: ${bb.industry} / ${bb.niche}`);
    lines.push(`Voice: ${bb.voiceAttributes.join(", ")}`);
    lines.push(`Tone: ${bb.toneDescription}`);
    lines.push(`Writing style: ${bb.writingStyle}`);
    lines.push(`Target audience: ${bb.targetAudience.primary}`);
    lines.push(`Value proposition: ${bb.uniqueValueProposition}`);
    lines.push(`Market position: ${bb.marketPosition}`);
    if (bb.contentThemes.length > 0) {
      lines.push(`Content themes: ${bb.contentThemes.join(", ")}`);
    }
    if (bb.topicsToAvoid.length > 0) {
      lines.push(`Topics to AVOID: ${bb.topicsToAvoid.join(", ")}`);
    }
    if (bb.keyMessages.length > 0) {
      lines.push(`Key messages to reinforce: ${bb.keyMessages.slice(0, 3).join("; ")}`);
    }
    lines.push(`CTA style: ${bb.contentGuidelines.callToActionStyle}`);
    lines.push(`Image style: ${bb.visualIdentity.imageStyle}`);
  } else {
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

  lines.push("");
  lines.push("═══════════════════════════════");
  lines.push("CHECKLIST");
  lines.push("═══════════════════════════════");
  lines.push("SEO: keyword in title/intro/H2s/seo_title/meta, 5-8 variants, sentence case");
  lines.push("AEO: core argument, definition block, 5 FAQs, bold claims, EEAT signals");
  lines.push("GEO: 3+ attributed stats, 5+ named entities, date-anchored facts");
  lines.push("CRITICAL: content_md has NO H1 — only H2/H3. The 'title' field is the H1.");

  return lines.join("\n");
}
