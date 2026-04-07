/**
 * Composes **system** + **user** messages for post generation.
 * Rule text: `instruction-chunks.ts` + embedding order via `instruction-embeddings.ts`.
 * Brand text: `generate-client-instructions.ts` → `clients.custom_instructions` (sections ranked by embeddings per task).
 */

import type { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildClientInstructionsWithEmbeddingOrder,
  joinClientInstructionChunksCanonical,
  parseClientInstructionsIntoChunks,
} from "./client-instruction-embeddings";
import { CONTENT_TYPE_PROMPT_HINT, SYSTEM_INSTRUCTIONS_GENERAL } from "./instruction-chunks";
import {
  buildGeneralInstructionsWithEmbeddingOrder,
  buildInstructionRetrievalQuery,
} from "./instruction-embeddings";
import type { InstructionSelectionContext, InstructionTaskKind } from "./instruction-embeddings";
import type { EnrichedUrl } from "./site-urls";

export type { InstructionSelectionContext, InstructionTaskKind };

/** Combined system instructions: general + client-specific (when provided). */
export function getSystemInstructions(clientSpecificInstructions: string | null): string {
  const base = SYSTEM_INSTRUCTIONS_GENERAL;
  if (!clientSpecificInstructions?.trim()) return base;
  return `${base}\n\n${clientSpecificInstructions.trim()}`;
}

/**
 * Brand/domain-specific block lives in `clients.custom_instructions`.
 * Optional editorial reinforcement (admin) lives in `clients.instruction_reinforcement` and is **appended** for the model only — not brand identity.
 */
export function combineClientInstructionsForModel(
  customInstructions: string | null | undefined,
  instructionReinforcement: string | null | undefined,
): string | null {
  const base = customInstructions?.trim() ?? "";
  const extra = instructionReinforcement?.trim() ?? "";
  if (!base && !extra) return null;
  if (!extra) return base || null;
  if (!base) {
    return `═══════════════════════════════════════\nOPTIONAL EDITORIAL REINFORCEMENT (admin)\n═══════════════════════════════════════\n\n${extra}`;
  }
  return `${base}\n\n═══════════════════════════════════════\nOPTIONAL EDITORIAL REINFORCEMENT (admin — appended to client-specific instructions above; editorial voice & structure, not brand)\n═══════════════════════════════════════\n\n${extra}`;
}

/**
 * Splits {@link combineClientInstructionsForModel} output so optional editorial reinforcement is never
 * reordered with embedding-ranked BRAND/WEBSITE chunks — it always stays at the end of the system prompt.
 */
function splitCombinedClientInstructionsForEmbedding(
  combined: string | null | undefined,
): { baseForEmbedding: string | null; reinforcementTail: string | null } {
  const t = combined?.trim();
  if (!t) return { baseForEmbedding: null, reinforcementTail: null };

  const sep = "\n\n═══════════════════════════════════════\nOPTIONAL EDITORIAL REINFORCEMENT";
  const i = t.indexOf(sep);
  if (i >= 0) {
    const base = t.slice(0, i).trim();
    const tail = t.slice(i).trim();
    return { baseForEmbedding: base || null, reinforcementTail: tail };
  }

  if (t.startsWith("═══════════════════════════════════════\nOPTIONAL EDITORIAL REINFORCEMENT")) {
    return { baseForEmbedding: null, reinforcementTail: t };
  }

  return { baseForEmbedding: t, reinforcementTail: null };
}

/**
 * General middle sections + client-specific sections are each ordered with Gemini Embedding 2 for the
 * current task (`ctx.taskKind`). Prefix/suffix of general rules stay fixed. Falls back to
 * {@link getSystemInstructions} if general embedding fails.
 */
export async function resolveSystemInstructionsWithEmbeddings(
  genAI: GoogleGenerativeAI,
  clientSpecificInstructions: string | null,
  ctx: InstructionSelectionContext,
): Promise<string> {
  try {
    const general = await buildGeneralInstructionsWithEmbeddingOrder(genAI, ctx);
    const { baseForEmbedding, reinforcementTail } = splitCombinedClientInstructionsForEmbedding(clientSpecificInstructions);

    if (!baseForEmbedding?.trim() && !reinforcementTail?.trim()) return general;

    let clientBlock = "";
    if (baseForEmbedding?.trim()) {
      const chunks = parseClientInstructionsIntoChunks(baseForEmbedding);
      const q = buildInstructionRetrievalQuery(ctx);
      try {
        if (chunks.length <= 1) {
          clientBlock = chunks[0]?.text ?? baseForEmbedding.trim();
        } else {
          clientBlock = await buildClientInstructionsWithEmbeddingOrder(genAI, chunks, q);
        }
      } catch (ce) {
        console.warn("[instructions] Client embedding order failed, using canonical section order:", ce);
        clientBlock = chunks.length ? joinClientInstructionChunksCanonical(chunks) : baseForEmbedding.trim();
      }
    }

    const tail = reinforcementTail?.trim() ? `\n\n${reinforcementTail.trim()}` : "";
    if (!clientBlock.trim()) {
      return `${general}${tail}`;
    }
    return `${general}\n\n${clientBlock}${tail}`;
  } catch (e) {
    console.warn("[instructions] Embedding ordering failed, using canonical general instructions:", e);
    return getSystemInstructions(clientSpecificInstructions);
  }
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
  /** Full https URLs + page titles for in-body internal links (from sitemap + fetch) */
  internalLinkCandidates?: EnrichedUrl[] | null;
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
  const localeLabel =
    post.locale === "pt"
      ? "European Portuguese (Portugal) — Write in pt-PT. Use Portugal-specific vocabulary and spelling: «utilizador» (not «usuário»), «ficheiro» (not «arquivo»), «ecrã» (not «tela»), «telemóvel» (not «celular»), «autocarro» (not «ônibus»), «computador portátil» (not «notebook»), «anúncio» (not «propaganda»). Avoid Brazilian Portuguese idioms, spelling variants (e.g. «atividade» → pt-PT «actividade» per old spelling; use the current post-2009 agreement only if it matches pt-PT usage). Do NOT write in Brazilian Portuguese."
      : post.locale === "en"
        ? "English"
        : post.locale === "fr"
          ? "French"
          : post.locale;
  lines.push(`Language: ${localeLabel}`);
  lines.push(`Content type: ${post.content_type} — ${CONTENT_TYPE_PROMPT_HINT[post.content_type] ?? "standard"}`);
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

  const linkCandidates = client.internalLinkCandidates?.filter((c) => c?.url) ?? [];
  if (linkCandidates.length > 0) {
    const fmt = (c: EnrichedUrl) => (c.title ? `${c.url} | "${c.title}"` : c.url);
    lines.push("");
    lines.push("═══════════════════════════════");
    lines.push("INTERNAL LINKS — 3 contextual links");
    lines.push("═══════════════════════════════");
    lines.push("Match each anchor to the page whose title best describes that topic. Use semantic matching.");
    linkCandidates.slice(0, 50).forEach((c, i) => lines.push(`  ${i + 1}. ${fmt(c)}`));
    lines.push("");
    lines.push("For each link: pick the URL whose page title is the best semantic match for your anchor phrase. Avoid generic section roots. Use anchor text people would search.");
  }

  lines.push("");
  lines.push("═══════════════════════════════");
  lines.push("SESSION CHECKLIST (system instructions hold full SEO/AEO/GEO/FAQ/schema rules)");
  lines.push("═══════════════════════════════");
  lines.push("Use the system instructions as the authority for structure, scoring targets, and JSON fields.");
  lines.push("Publishing requires rounded average of seo/aeo/geo ≥ 90 after the post-generation quality pass.");
  if (client.recentPostTitles?.length) {
    lines.push("CRITICAL: Choose a completely different topic and angle from the RECENT ARTICLES listed above — do not repeat those titles or subjects.");
  }
  lines.push("CRITICAL: content_md has NO H1, NO date line, NO cover image — only H2/H3. Start with the intro paragraph.");
  lines.push("CRITICAL: Scannable layout — short paragraphs, visual rhythm (lists / ### under H2), punchline takeaways; no long unbroken text blocks.");
  if (linkCandidates.length > 0) {
    lines.push("CRITICAL: 3 internal links. Semantic match: anchor phrase → page whose title best fits. Real search phrases, not generic.");
  } else {
    lines.push("CRITICAL: No internal site URL list was provided — do not add internal [text](url) links to the site.");
  }
  lines.push("CRITICAL: Cover fields — on-image text ENGLISH only; cover_image_description in English; follow BRAND VISUAL in system/client instructions.");
  lines.push("seo_score in JSON: self-assess per system instructions; if average would be < 90, notes = specific gaps.");

  return lines.join("\n");
}
