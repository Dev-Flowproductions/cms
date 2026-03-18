# AEO Gap Detection → Content Brief System

**Type:** Process Documentation  
**Owner:** Witfy Demand Generation Platform  
**Last updated:** March 2026  
**Audience:** CMS Agent Apps, Content Orchestration Systems, Monthly Calendar Builders

---

## What this is

This document explains the exact mechanism Witfy uses to detect **AI visibility gaps** (searches where your brand is invisible in AI-generated answers) and automatically convert those gaps into **production-ready article briefs**.

The output of this system replaces keyword-repetition calendars with content that is **grounded in real AI answer data** — it only generates articles for topics where the brand is currently not showing up in ChatGPT, Gemini, or Perplexity.

This is the intelligence layer a CMS agent should use instead of keyword frequency or generic topic clustering.

---

## The 3-stage pipeline

```
Strategy → Prompt Bank → AEO Scan → Gap Detection → Article Briefs → Campaign
```

| Stage | What happens | Data stored |
|---|---|---|
| 1. Prompt Bank | AI generates 50 realistic user queries for this brand | `aeo_prompts` table |
| 2. AEO Scan | Each query is sent to Gemini (+ optionally Perplexity) with web search grounding | `aeo_geo_runs`, `aeo_geo_results` tables |
| 3. Gap Detection | Queries where `brand_mentioned = false` are collected | Filtered from `aeo_geo_results` |
| 4. Brief Generation | Gemini generates 3–5 full article briefs targeting only the gap queries | Saved to `dg_campaigns.assets.seo_articles` |

---

## Stage 1 — Prompt bank generation

### Purpose

Build 50 queries that a real human would type into an AI chatbot when researching a product or service in this brand's category. These are not SEO keywords — they are **natural-language AI search queries**.

### Inputs pulled from `dg_strategies`

| Field | Used as |
|---|---|
| `target_language` | All 50 prompts must be written in this language |
| `target_region` | Regional terminology, spelling, local context |
| `value_proposition` | Frames the problem space |
| `brand_tone` | Informs comparison angle |
| `category_keywords` | Seed terms for category-level queries |
| `icp_definition.icp.industries` | Target market context |
| `icp_definition.icp.painPoints` | Problem-oriented query generation |
| `buying_committee_tiers[].title` | Persona-level queries (e.g. "best tool for CFO") |

Plus from `dg_projects`:
- `name` — the brand name (used in `direct` cluster queries)
- `website_url` — context
- `description` — supplementary context

### Prompt distribution (50 total)

| Cluster | Count | Intent |
|---|---|---|
| `category` | 20 | Broad "best X for Y" market-exploration queries using buyer pain points |
| `comparison` | 10 | Competitor comparisons and persona comparisons (e.g. "vs CompetitorX for SaaS CFOs") |
| `solution` | 15 | Problem-solving queries directly tied to ICP pain points: "how do I fix [pain]?" |
| `direct` | 5 | Brand-awareness queries specifically about the brand by name |

### Language requirement

> **Critical:** All 50 prompts are written in the strategy's `target_language`. They are NOT literal translations — they are written as a native speaker in that market would naturally search. Regional spelling conventions and local terminology apply.

### Output schema (stored in `aeo_prompts`)

```json
{
  "prompt": "qual a melhor ferramenta de automação de vendas B2B para pequenas empresas?",
  "cluster": "category"
}
```

### How the Gemini prompt is structured (summary for replication)

```
System role: AEO expert generating AI chatbot search queries

Context block:
  - Brand name, website, industry, region, value proposition, brand tone,
    seed keywords, buyer personas (from buying_committee_tiers),
    pain points (from icp_definition)

Language block:
  - "ALL 50 prompts MUST be written in [language]"
  - "Write as a native speaker — do NOT translate literally"

Distribution block:
  - Exact counts per cluster (20/10/15/5)
  - Cluster definitions

Output block:
  - "Return ONLY a valid JSON array of exactly 50 objects"
  - Schema: { prompt: string, cluster: "category"|"comparison"|"solution"|"direct" }
```

---

## Stage 2 — AEO scan

### Purpose

Send each of the 50 prompts to one or more AI engines **with web search grounding** and record whether the brand is mentioned in the answer.

### Engines

| Engine | Implementation | Grounding |
|---|---|---|
| Gemini | `gemini-3.1-flash-lite-preview` via `@google/genai` | `google_search` tool enabled |
| Perplexity | `llama-3.1-sonar-large-128k-online` via REST API | Online by default |

Both engines are run. Gemini is primary (all 50 prompts). Perplexity is secondary (first 10, if API key configured).

### What is scored per result

For each prompt, the following is recorded in `aeo_geo_results`:

| Column | Type | Meaning |
|---|---|---|
| `brand_mentioned` | boolean | Was the brand name found in the AI answer? |
| `brand_position` | int | Position in the answer (1 = first mention, null if not mentioned) |
| `sentiment` | `positive \| neutral \| negative` | Tone when the brand is mentioned |
| `citations_json` | JSONB array | Source URLs the AI cited |
| `competitors_mentioned` | text[] | Competitor names found in the answer |
| `response_excerpt` | text | First ~500 chars of the AI answer |

### Aggregate scores computed per run (stored in `aeo_geo_runs`)

| Metric | Formula |
|---|---|
| `inclusion_rate` | `mentions / total_prompts` — core visibility metric |
| `citation_coverage` | `prompts with ≥1 citation / total_prompts` |
| `share_of_voice` | `brand_mentions / (brand_mentions + competitor_mentions)` |
| `placement_score` | Average of `1 / brand_position` (higher when brand appears earlier) |
| `sentiment_score` | `(positive × 1 + neutral × 0.5 + negative × 0) / mentioned_count` |
| `ai_visibility_score` | Composite 0–100: `(inclusion × 0.35) + (citation × 0.25) + (sov × 0.20) + (placement × 0.15) + (sentiment × 0.05) × 100` |

---

## Stage 3 — Gap detection

### Definition of a gap

An AEO gap is any prompt where `brand_mentioned = false` AND `engine = 'gemini'` in the latest scan run.

A gap means: when a real user asks this question to an AI chatbot, the brand is **completely absent** from the answer.

### Gap retrieval query

```sql
SELECT
  r.id,
  r.prompt_id,
  p.prompt_text,
  p.intent_cluster
FROM aeo_geo_results r
JOIN aeo_prompts p ON r.prompt_id = p.id
WHERE r.run_id = :latest_run_id
  AND r.brand_mentioned = false
  AND r.engine = 'gemini'
LIMIT 30;
```

Gaps are deduplicated by `prompt_text` and capped at 20 unique gaps to keep the brief-generation prompt manageable.

### Gap grouping

Gaps are grouped by their `intent_cluster` before being sent to the brief generator. This produces structured context like:

```
[CATEGORY]
1. best B2B sales automation tool for startups
2. top revenue intelligence platforms for SaaS companies

[SOLUTION]
1. how to reduce sales cycle length in B2B
2. how to align marketing and sales teams
```

---

## Stage 4 — Article brief generation

### Purpose

Take the gap queries and generate **3–5 full production-ready article briefs** that, once published and indexed, will cause AI chatbots to include the brand in their answers to those queries.

The number of briefs scales with the gap count: `min(5, max(3, floor(gap_count / 4)))`.

### Why this approach produces better content than keyword-based calendars

1. **Every article targets a real AI answer gap** — not a keyword guess. The article only gets written if the brand is actually invisible for that topic.
2. **The brief includes a `core_argument`** — a specific, defensible POV that AI chatbots can cite directly. Generic best-practice content is not citable.
3. **The brief mandates AEO structure** — FAQ section, EEAT signals, bold key claims, structured headings — all patterns that AI models prefer when selecting citations.
4. **Content is in the strategy's `target_language`** — not English by default. A brand targeting Brazil gets Portuguese briefs without translation.
5. **Deduplication is baked in** — the same gap query will not generate two different articles. If an article already covers that `target_keyword`, it is not regenerated.

### Full brief schema

Each generated article brief includes:

| Field | Description |
|---|---|
| `title` | Working article title |
| `seo_title` | Optimized `<title>` tag (≤60 chars) |
| `slug` | URL-safe slug |
| `meta_description` | SEO meta description (≤160 chars) |
| `target_keyword` | **Must be one of the exact gap prompt texts** — this is the AEO anchor |
| `secondary_keywords` | Related terms, comma-separated |
| `buyer_stage` | `awareness`, `consideration`, or `decision` |
| `word_count_target` | Target length (number) |
| `core_argument` | The single specific, defensible claim this article makes |
| `tone_and_voice` | Writing instructions derived from `brand_tone` |
| `outline` | Full markdown H2/H3 structure |
| `faq` | 5 Q&A pairs in markdown (AI chatbots cite FAQs heavily) |
| `eeat_signals` | Specific data points, first-person examples, named methodologies to include |
| `internal_linking_targets` | Pages on the site this article should link to |
| `featured_image_concept` | Visual description for image generation |
| `non_gated_cta` | CTA that does not require a form — keeps reader on-site |
| `source` | Always `"aeo_gap"` (tag for CMS filtering) |
| `aeo_gap_run_id` | UUID of the scan this brief was generated from |

### The Gemini system prompt structure (for replication)

The brief-generation prompt is built in two parts: `systemInstruction` + `userPrompt`.

**System instruction:**

```
Role: World-class B2B Content Strategist and AEO/GEO Specialist (2026)
Goal: Create articles that AI chatbots will cite

Context block:
  - Brand name, website, target market (from icp.industries)
  - Region, value proposition, brand tone
  - Core buyer pain points (first 3 from icp.painPoints)

Mission block:
  - "These are REAL queries where AI chatbots answer WITHOUT mentioning [Brand]"
  - "Brief [N] articles that will cause AI chatbots to include [Brand] in answers"

AEO principles (applied to every brief):
  - Clear definitions in opening paragraph
  - Bold key claims and statistics
  - Structured FAQ (5 Q&As minimum)
  - EEAT signals: first-person examples, specific data points, named methodologies
  - Specific, defensible POV — never generic best practices
  - Internal linking targets
  - Non-gated CTA

Language rule:
  - "Write ALL output in [target_language]" — non-negotiable

Writing style rules:
  - Sentence case titles (capitalize first word only)
  - Proper nouns always capitalized
  - Acronyms in standard form (AI, SaaS, B2B, etc.)
  - No em dashes
```

**User prompt:**

```
VISIBILITY GAPS (searches where [Brand] is invisible to AI):

[CATEGORY]
1. [gap prompt text]
2. [gap prompt text]

[SOLUTION]
1. [gap prompt text]

Generate exactly [N] production-ready article briefs.
Each brief targets one or more of the gap prompts as its primary keyword.
Include ALL fields: title, seo_title, slug, meta_description, target_keyword,
secondary_keywords, buyer_stage, word_count_target, core_argument, tone_and_voice,
outline, faq, eeat_signals, internal_linking_targets, featured_image_concept, non_gated_cta.
```

### Model config

```
model:                gemini-3.1-flash-lite-preview
responseMimeType:     application/json
responseSchema:       structured schema enforcing all brief fields
temperature:          0.5
maxOutputTokens:      32768
```

---

## How this feeds into a monthly content calendar

### For a CMS Agent, the recommended flow is:

1. **Pull the gap list** from the most recent AEO scan (query `aeo_geo_results` where `brand_mentioned = false`, join `aeo_prompts`)
2. **Run brief generation** (or consume already-generated briefs tagged `source = "aeo_gap"` from the campaign's `seo_articles`)
3. **Score briefs by cluster** — `solution` cluster gaps typically drive the most direct traffic; `category` gaps build topical authority for recurring coverage
4. **Schedule by gap cluster:**
   - Week 1: `solution` articles (highest urgency — direct pain-point answers)
   - Week 2: `category` articles (topical authority building)
   - Week 3: `comparison` articles (bottom-funnel, highest conversion intent)
   - Week 4: `direct` brand articles (reputation reinforcement)
5. **Set `word_count_target`** from the brief field — AEO articles need depth; minimum 1,200 words for solution queries, 2,000+ for comparison
6. **Never reuse a `target_keyword`** that already has a published article — deduplication is built into the brief generator but the CMS should enforce this too

### What to avoid (and why keyword-only calendars fail)

| Keyword approach | AEO gap approach |
|---|---|
| Derived from search volume | Derived from actual AI answer absence |
| Same topics repeat when volume is high | New topics every cycle (based on latest scan) |
| No guarantee of AI citability | Designed around AI citation patterns |
| Language-agnostic by default | Written in strategy's target language natively |
| Generic best-practice structure | Mandates specific POV + EEAT + FAQ |
| No connection to sales motion | Tied to `buyer_stage` and ICP pain points |

---

## Data schema reference

### `aeo_prompts`
```sql
id            UUID PK
workspace_id  UUID → workspaces
project_id    UUID → dg_projects
prompt_text   TEXT    -- the actual search query
intent_cluster TEXT   -- category | comparison | solution | direct
created_at    TIMESTAMPTZ
```

### `aeo_geo_runs`
```sql
id                  UUID PK
workspace_id        UUID
project_id          UUID
run_at              TIMESTAMPTZ
prompts_run         INT
inclusion_rate      NUMERIC(5,4)   -- 0.0–1.0
citation_coverage   NUMERIC(5,4)
share_of_voice      NUMERIC(5,4)
placement_score     NUMERIC(5,4)
sentiment_score     NUMERIC(5,4)
ai_visibility_score NUMERIC(5,2)   -- 0–100
engines             TEXT[]         -- ['gemini', 'perplexity']
```

### `aeo_geo_results`
```sql
id                    UUID PK
run_id                UUID → aeo_geo_runs
prompt_id             UUID → aeo_prompts (nullable)
engine                TEXT           -- 'gemini' | 'perplexity'
brand_mentioned       BOOLEAN        -- KEY gap indicator
brand_position        INT            -- 1-indexed position in answer
sentiment             TEXT           -- 'positive' | 'neutral' | 'negative'
citations_json        JSONB          -- [{ url, title }]
competitors_mentioned TEXT[]         -- competitor names found
response_excerpt      TEXT           -- first ~500 chars of AI answer
```

### `dg_strategies` fields consumed by this system
```sql
target_language        TEXT    -- "Portuguese", "Spanish", "English", etc.
target_region          TEXT    -- "Brazil", "LATAM", "US", etc.
value_proposition      TEXT    -- what makes this brand different
brand_tone             TEXT    -- "Direct and professional", "Friendly and expert", etc.
category_keywords      TEXT[]  -- seed terms
icp_definition         JSONB   -- { icp: { industries: [], painPoints: [] } }
buying_committee_tiers JSONB[] -- [{ title: "CFO", role: "economic buyer" }]
```

### Article brief shape (as stored in `dg_campaigns.assets.seo_articles[]`)
```json
{
  "title": "Como reduzir ciclos de venda em empresas B2B",
  "seo_title": "Reduzir ciclo de vendas B2B: guia prático 2026",
  "slug": "como-reduzir-ciclo-vendas-b2b",
  "meta_description": "Aprenda as estratégias comprovadas para encurtar o ciclo de vendas...",
  "target_keyword": "como reduzir o ciclo de vendas em empresas B2B",
  "secondary_keywords": "automação de vendas, alinhamento marketing vendas, sales velocity",
  "buyer_stage": "consideration",
  "word_count_target": 1800,
  "core_argument": "Empresas B2B que implementam pontuação de leads baseada em intenção reduzem ciclos em 30%",
  "tone_and_voice": "Direct and data-driven. Use real examples. Avoid generic advice.",
  "outline": "## Por que ciclos longos acontecem\n### Sintomas de um processo desalinhado\n## ...",
  "faq": "**O que é ciclo de vendas B2B?** ...\n\n**Como medir velocity de vendas?** ...",
  "eeat_signals": "Include a real case study from a SaaS company, cite Gartner or McKinsey data, name the methodology",
  "internal_linking_targets": "/inteligencia-de-receita, /automacao-vendas",
  "featured_image_concept": "Sales funnel diagram with a clock showing compression between stages",
  "non_gated_cta": "Download our sales cycle benchmark report (no email required)",
  "source": "aeo_gap",
  "aeo_gap_run_id": "uuid-of-the-scan-run"
}
```

---

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/analytics/aeo/prompts?projectId=` | Generate the 50-prompt bank using strategy context |
| `GET` | `/api/analytics/aeo/prompts?projectId=` | Retrieve existing prompts + strategy preview |
| `POST` | `/api/analytics/aeo/run?projectId=` | Run the AEO scan (sends all prompts to Gemini + Perplexity) |
| `GET` | `/api/analytics/aeo/run?projectId=` | Get run history + results from latest scan |
| `POST` | `/api/analytics/aeo/gaps-to-campaign` | Generate article briefs from gaps, save to campaign |

### `gaps-to-campaign` request body
```json
{
  "projectId": "uuid",
  "runId": "uuid (optional — defaults to latest run)"
}
```

### `gaps-to-campaign` response
```json
{
  "campaignId": "uuid",
  "campaignName": "string",
  "articlesAdded": 4,
  "totalArticles": 7,
  "gapCount": 14,
  "articles": [ ...brief objects... ]
}
```

---

## Recommended integration pattern for a CMS Agent

```
1. GET /api/analytics/aeo/run?projectId=X
   → Check if last run is < 30 days old
   → If stale: POST /api/analytics/aeo/run?projectId=X to refresh

2. GET /api/analytics/aeo/prompts?projectId=X
   → Load gap count from run results
   → Filter aeo_geo_results where brand_mentioned=false for this run_id

3. POST /api/analytics/aeo/gaps-to-campaign
   body: { projectId, runId }
   → Receive article briefs array

4. For each brief in articles[]:
   - Use target_keyword as the primary content anchor
   - Use outline as the article structure
   - Use faq as a mandatory section (5 Q&As minimum)
   - Use eeat_signals as editorial instructions
   - Respect word_count_target
   - Write entirely in the language indicated in strategy.target_language
   - Do not publish if a live article already targets this target_keyword

5. Schedule by buyer_stage:
   - awareness → educational, top-of-funnel, longer form
   - consideration → comparison + proof-based
   - decision → ROI, case studies, pricing context
```

---

*This document was generated from the live implementation in the Witfy Demand Generation Platform. All prompts, schemas and API contracts reflect the exact production code.*
