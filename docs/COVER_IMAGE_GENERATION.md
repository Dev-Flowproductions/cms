# Cover image generation and company style

This document describes how the CMS generates **blog cover images** (16:9 hero banners) and keeps them aligned with each **client’s** visual identity—not generic stock art.

## Where generation runs

The same pipeline is used in:

- **Post generation** — `lib/agent/execute-generate-post.ts` (manual “Generate with AI” and DG brief flows).
- **Scheduler** — `app/api/scheduler/route.ts` (automated posts for due clients).
- **Dedicated cover API** — `app/api/agent/cover/route.ts` (regenerate cover for an existing post).

Images are produced with **Google Gemini** (`gemini-3.1-flash-image-preview`), **16:9**, **2K** resolution (`lib/agent/gemini-cover-image.ts`). Successful outputs are uploaded to Supabase Storage (`covers` bucket) and linked on `posts.cover_image_path`.

## How company style is enforced (layers)

Style is not a single string—it is built from **several inputs** that stack together.

### 1. Brand colours and voice (database)

From the `clients` row (and resolved brand colours, including fallbacks from the brand book when needed):

- **Primary, secondary, tertiary, alternative** colours drive the **COLOUR SYSTEM** in the raster prompt: a chosen background from the palette, accents from the rest, and explicit instruction to avoid unrelated “agency” palettes (`lib/agent/cover-prompt.ts`).
- **`font_style`** and **`brand_voice`** set typography feel and mood on the banner.

`resolveClientBrandColors` (`lib/agent/resolve-client-brand-colors.ts`) ensures consistent hex values fed into that prompt.

### 2. Brand book visual identity (JSON)

When present, `brand_book.visualIdentity` adds:

- **`aestheticStyle`** — combined with `font_style` for typography direction.
- **`imageStyle`** — explicit illustration / image direction for the generator.
- **`colorPalette`** — used when structured client colours are thin; can back the background rule.

### 3. Custom instructions (embedding-ranked for “cover”)

The client’s **`custom_instructions`** (and related reinforcement) are split into chunks and **re-ordered with Gemini embeddings** for the current task (`taskKind: "cover"`) so the most relevant brand rules float to the top of the prefix (`lib/agent/instruction-embeddings.ts` → `buildCoverInstructionEmbeddingPrefixWithMeta`).

That prefix is wrapped as **PRIMARY INSTRUCTIONS** when `enforcePrimaryInstructionEmbedding` is true (default in generate/scheduler paths), so the image model sees brand context **before** the topic-specific body.

### 4. CMS editorial rules (cover + formatting chunks)

General chunks **`cover`** and **`formatting`** from `lib/agent/instruction-chunks.ts` are also **embedding-ranked** for the cover task and merged into the prefix. They align JSON generation (`cover_image_description`, `cover_image_headline`) with raster rules—for example:

- Sparse composition, clear centre for headline.
- **On-image text is always English** (even for PT/FR posts); European sentence case; no logos on the image.

### 5. Reference banner images (strongest style signal)

Clients can upload up to **three** reference images (paths on the client row, files in the **`brand-assets`** bucket). The system:

1. **Downloads** them as base64 parts (`lib/agent/cover-reference-images.ts` — `loadCoverReferenceImageParts`).
2. Runs a **vision pass** with Gemini (`lib/agent/cover-reference-vision.ts`) to produce a short, dense **“visual analysis”** brief (medium, colour, composition, typography on refs, mood). That brief is injected into the text sent to the image model and participates in embedding retrieval.
3. Sends **multimodal** requests: **text prompt + the same reference images** to the image model (`generateGeminiCoverImageBufferWithReferences`) so the output **matches the medium** (photo vs illustration vs flat design), not only colours in prose.

When references exist, `buildCoverPrompt` switches the style line to: **match the reference images’ aesthetic exactly**—including not defaulting to “vector illustration” if the company uses photography (`lib/agent/cover-prompt.ts`, `hasReferenceImages`).

### 6. Brand guidelines document (plain text)

If **`brand_guidelines_text`** is set (extracted/uploaded guidelines), a trimmed block (up to ~4000 characters) is appended under **CLIENT VISUAL GUIDELINES** in the final prompt (`appendGuidelinesToPrompt` in `lib/agent/gemini-cover-image.ts`).

### 7. Topic-specific raster prompt (`buildCoverPrompt`)

The **subject** comes from the model’s `cover_image_description` or a safe default tied to the article topic. A **random composition variation** keeps layouts fresh while staying editorial. The **headline** on the image uses `cover_image_headline` or a short slice of the title, with rules for non-English titles (derive short English on-image text).

## End-to-end call: `generateCoverImageBufferWithEmbedFallback`

`lib/agent/gemini-cover-image.ts` assembles the final string roughly as:

1. **Embed prefix** (PRIMARY when enforced) — ranked client chunks + ranked cover/formatting rules.
2. **Reference vision brief** (if any).
3. **Explicit reference-image instructions** (if multimodal refs are present).
4. **Base prompt** from `buildCoverPrompt` (colours, typography, composition, English headline rules).
5. **Guidelines** appendix (if present).

It then:

1. Tries **multimodal** generation (text + up to 3 reference images).
2. Falls back to **text-only** with the full string if multimodal returns no image.
3. If embedding enforcement is off and a prefix exists, may retry **text-only without** the embed prefix (lenient paths only).

The dedicated **`/api/agent/cover`** route can fall back to a **Picsum** placeholder if Gemini fails (product behaviour for that endpoint only).

## Summary

| Input | Role |
|--------|------|
| Client colours + `font_style` + `brand_voice` | Palette and mood in every cover |
| Brand book `visualIdentity` | Richer art direction when present |
| `custom_instructions` (embedding-ranked) | Client-specific rules surfaced for the cover task |
| Cover + formatting chunks (embedding-ranked) | CMS-wide hero layout and English-on-image policy |
| Up to 3 reference images + vision brief | **Style lock** to real company banners |
| `brand_guidelines_text` | Extra written visual rules |
| `buildCoverPrompt` | 16:9 editorial structure, headline, composition variety |

Together, these layers keep generated covers **on-brand** rather than generic: colours and typography from the account, rules from instructions and guidelines, and **visual DNA** from reference images when the client provides them.
