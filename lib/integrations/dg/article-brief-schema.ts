import { z } from "zod";

/** Many clients send JSON `null` for omitted optionals; coerce to undefined for Zod + downstream. */
function dgNullToUndefined<T>(val: T | null | undefined): T | undefined {
  return val === null ? undefined : val;
}

const optionalString = z.preprocess(dgNullToUndefined, z.string().optional());

const suggestedSourceSchema = z.object({
  title: optionalString,
  url: optionalString,
});

/** Request body for POST /api/integrations/dg/article-briefs (shared contract). */
export const dgArticleBriefRequestSchema = z.object({
  request_id: z.string().uuid(),
  source: z.literal("dg").optional(),
  dg_workspace_id: optionalString,
  dg_client_id: optionalString,
  dg_project_id: z.string().min(1),
  dg_strategy_id: z.string().min(1),
  dg_campaign_id: z.union([z.string(), z.null()]).optional(),
  cms_site_id: z.string().uuid(),
  title: optionalString,
  brief_md: z.string().min(1),
  primary_keyword: optionalString,
  secondary_keywords: z.preprocess(dgNullToUndefined, z.array(z.string()).optional()),
  search_intent: optionalString,
  buyer_stage: optionalString,
  target_persona: optionalString,
  brand_tone: optionalString,
  language: z.string().min(1),
  country: optionalString,
  cta_goal: optionalString,
  requested_due_date: optionalString,
  suggested_sources: z.preprocess(
    dgNullToUndefined,
    z.array(suggestedSourceSchema).optional(),
  ),
  metadata: z.preprocess(dgNullToUndefined, z.record(z.unknown()).optional()),
});

export type DgArticleBriefRequest = z.infer<typeof dgArticleBriefRequestSchema>;

export function normalizeDgLanguage(lang: string): "pt" | "en" | "fr" {
  const lower = lang.trim().toLowerCase();
  if (lower === "pt" || lower.startsWith("pt-")) return "pt";
  if (lower === "fr" || lower.startsWith("fr-")) return "fr";
  if (lower === "en" || lower.startsWith("en-")) return "en";
  return "en";
}
