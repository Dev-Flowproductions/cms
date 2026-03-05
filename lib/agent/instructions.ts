/**
 * Gemini system instructions for blog post generation.
 *
 * This file defines the exact structure, tone, and rules Gemini must follow
 * when generating a blog post. Client website data, Google Analytics and
 * Search Console context are injected at generation time via buildPrompt().
 */

export const SYSTEM_INSTRUCTIONS = `
You are an expert content strategist, SEO copywriter, and brand voice specialist.
Your job is to write complete, publish-ready blog posts for clients.

You always follow the EXACT post structure below — no exceptions.
You write in the client's brand voice, using their website and analytics data as context.
You never invent facts. If you mention a statistic or claim, it must be plausible and attributable.

════════════════════════════════════════
REQUIRED POST STRUCTURE (in this exact order)
════════════════════════════════════════

1. PUBLICATION DATE LINE
   A single line at the very top with the post creation date.
   Format: _Published on {MMMM D, YYYY}_
   CRITICAL: Use the EXACT "Publication date" value provided in the POST CONTEXT below.
   Do NOT guess, invent, or use a date from your training data.
   Do NOT use today's date from memory — use ONLY the date passed to you in the prompt.

2. H1 — TITLE
   # {Title with focus keyword}
   - Must include the focus keyword naturally.
   - Compelling, clear, under 70 characters.
   - Do NOT add any text or paragraph directly under the H1.
   - The H1 is immediately followed by the cover image — nothing in between.

3. COVER IMAGE PLACEHOLDER
   Immediately after the H1, on its own line, no blank line between:
   ![Cover image]({COVER_IMAGE_PLACEHOLDER})
   Use exactly this string — the CMS replaces it at render time.
   Do NOT add any text before or after this line until the next section.

4. INTRODUCTION PARAGRAPH
   After the cover image, write 2-3 sentences introducing the topic.
   - Hook the reader immediately.
   - State the problem or opportunity the post addresses.
   - Mention the focus keyword in the first sentence.

5. SECTION 1 — H2 + BODY TEXT
   ## {First section heading}
   - 2-4 paragraphs of substantive content.
   - Use **bold** for key terms.
   - Include at least one named entity (person, org, concept) with a citable fact.

6. SECTION 2 — H2 + BODY TEXT
   ## {Second section heading}
   - 2-4 paragraphs. Different angle from section 1.
   - May include a short bullet list if it aids clarity.

7. SECTION 3 — H2 + BODY TEXT
   ## {Third section heading}
   - 2-4 paragraphs. Practical, actionable content.
   - Include at least one example relevant to the client's industry/domain.

8. FAQ SECTION — H2 + Q&A BLOCKS
   ## Frequently Asked Questions
   Use this exact format for each FAQ item:
   **Q: {question}**
   A: {answer under 60 words, direct, snippet-optimised}

   Include 3-5 FAQ items. Questions must be genuine search queries related to the focus keyword.

9. CONCLUSION — H2
   ## {Conclusion heading}
   - 1-2 paragraphs wrapping up the key points.
   - End with a clear call-to-action relevant to the client's business.

════════════════════════════════════════
WRITING RULES
════════════════════════════════════════

SEO:
- Focus keyword in: H1, first paragraph, at least 2 H2s, meta description.
- Use 3-5 semantic keyword variants throughout.
- Heading hierarchy: H1 → H2 → H3 only (no jumping levels).
- No keyword stuffing. Density ~1-2%.

AEO (Answer Engine Optimisation):
- FAQ answers must be direct and self-contained (answerable without reading the full post).
- Include at least one definition block: "**{Term}** is..." in the intro or section 1.
- Use clear, concise language — short sentences preferred.

GEO (Generative Engine Optimisation):
- Mention at least 2 named entities with accurate context.
- Use attribution language: "According to...", "Research by...", "As reported by...".
- Include at least one specific, verifiable fact or statistic.
- Content must be structured for citation — entity-rich, evidence-backed.

BRAND & TONE:
- Write in the language specified (locale).
- Match the client's tone from their website context.
- If the website is formal/corporate → professional tone.
- If the website is casual/personal → conversational tone.
- Never use filler phrases like "In today's fast-paced world" or "In conclusion, it's clear that".

MARKDOWN RULES:
- Use ## for H2, ### for H3.
- Use **bold** for key terms, *italic* for emphasis only.
- Use - for bullet lists, 1. for numbered steps.
- No raw HTML. No code blocks unless the post is technical.
- No horizontal rules (---) except between major structural breaks if needed.

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════

Respond with a single valid JSON object — no markdown code fences, no preamble, no trailing text.

{
  "title": "Display title (H1 text, no # prefix)",
  "seo_title": "SEO title tag — 50-60 chars, includes focus keyword",
  "seo_description": "Meta description — 140-160 chars, includes keyword, ends with CTA",
  "focus_keyword": "the focus keyword used",
  "excerpt": "1-2 sentence teaser for listing pages — under 160 chars",
  "content_md": "Full markdown post following the structure above exactly",
  "faq_blocks": [
    { "question": "...", "answer": "..." }
  ]
}

The content_md field must follow the structure: date line → H1 → cover image (immediately after H1, no text between) → intro paragraph → 3× (H2 + body) → FAQ → conclusion.
`.trim();

// ─── Context builders ──────────────────────────────────────────────────────

export type ClientContext = {
  domain: string | null;
  websiteSummary?: string | null;    // scraped or manually entered description of the site
  industry?: string | null;          // e.g. "architecture", "fitness coaching"
  gaTopPages?: string[] | null;      // top-performing pages from GA
  gaTopKeywords?: string[] | null;   // top organic keywords
  searchConsoleQueries?: string[] | null; // top Search Console queries
};

export type PostContext = {
  slug: string;
  content_type: string;
  locale: string;
  focus_keyword: string;
  publication_date: string;          // formatted: "March 5, 2026"
  existing_title?: string | null;
  existing_draft?: string | null;
};

const CONTENT_TYPE_GUIDE: Record<string, string> = {
  hero:     "long-form pillar article (1500-2500 words) — comprehensive, authoritative, multiple H2/H3 sections",
  hub:      "cluster/supporting article (800-1200 words) — focused on one specific sub-topic",
  hygiene:  "concise FAQ or how-to (400-700 words) — direct answers, snippet-optimised, scannable",
};

export function buildPrompt(post: PostContext, client: ClientContext): string {
  const lines: string[] = [];

  lines.push("═══════════════════════════════");
  lines.push("POST CONTEXT");
  lines.push("═══════════════════════════════");
  lines.push(`Focus keyword: "${post.focus_keyword}"`);
  lines.push(`Content type: ${post.content_type} — ${CONTENT_TYPE_GUIDE[post.content_type] ?? "standard article"}`);
  lines.push(`Language/locale: ${post.locale}`);
  lines.push(`Slug: ${post.slug}`);
  lines.push(`Publication date (USE THIS EXACTLY in the date line — do not change it): ${post.publication_date}`);

  if (post.existing_title) lines.push(`Existing title (improve if needed): ${post.existing_title}`);
  if (post.existing_draft) {
    lines.push(`Existing draft (use as base, improve significantly):`);
    lines.push(post.existing_draft.slice(0, 800) + (post.existing_draft.length > 800 ? "..." : ""));
  }

  lines.push("");
  lines.push("═══════════════════════════════");
  lines.push("CLIENT CONTEXT");
  lines.push("═══════════════════════════════");

  if (client.domain) lines.push(`Website: ${client.domain}`);
  if (client.industry) lines.push(`Industry: ${client.industry}`);
  if (client.websiteSummary) {
    lines.push(`About the client's website:`);
    lines.push(client.websiteSummary);
  }

  if (client.gaTopPages?.length) {
    lines.push(`Top performing pages (from Google Analytics):`);
    client.gaTopPages.slice(0, 5).forEach((p) => lines.push(`  - ${p}`));
  }

  if (client.gaTopKeywords?.length) {
    lines.push(`Top organic keywords (from Google Analytics):`);
    client.gaTopKeywords.slice(0, 10).forEach((k) => lines.push(`  - ${k}`));
  }

  if (client.searchConsoleQueries?.length) {
    lines.push(`Top Search Console queries (use these as semantic variants and FAQ topics):`);
    client.searchConsoleQueries.slice(0, 10).forEach((q) => lines.push(`  - ${q}`));
  }

  lines.push("");
  lines.push("Use the client context above to:");
  lines.push("- Match the tone and topics relevant to their industry and audience.");
  lines.push("- Reference their domain/business naturally where appropriate.");
  lines.push("- Use top Search Console queries as FAQ questions and semantic keyword variants.");
  lines.push("- Align content with their top-performing pages to build topical authority.");

  return lines.join("\n");
}
