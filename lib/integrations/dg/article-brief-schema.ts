import { z } from "zod";

const suggestedSourceSchema = z.object({
  title: z.string(),
  url: z.string(),
});

/** Request body for POST /api/integrations/dg/article-briefs (shared contract). */
export const dgArticleBriefRequestSchema = z.object({
  request_id: z.string().uuid(),
  source: z.literal("dg").optional(),
  dg_workspace_id: z.string().optional(),
  dg_client_id: z.string().optional(),
  dg_project_id: z.string().min(1),
  dg_strategy_id: z.string().min(1),
  dg_campaign_id: z.string().nullable().optional(),
  cms_site_id: z.string().uuid(),
  title: z.string().optional(),
  brief_md: z.string().min(1),
  primary_keyword: z.string().optional(),
  secondary_keywords: z.array(z.string()).optional(),
  search_intent: z.string().optional(),
  buyer_stage: z.string().optional(),
  target_persona: z.string().optional(),
  brand_tone: z.string().optional(),
  language: z.string().min(1),
  country: z.string().optional(),
  cta_goal: z.string().optional(),
  requested_due_date: z.string().optional(),
  suggested_sources: z.array(suggestedSourceSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type DgArticleBriefRequest = z.infer<typeof dgArticleBriefRequestSchema>;

export function normalizeDgLanguage(lang: string): "pt" | "en" | "fr" {
  const lower = lang.trim().toLowerCase();
  if (lower === "pt" || lower.startsWith("pt-")) return "pt";
  if (lower === "fr" || lower.startsWith("fr-")) return "fr";
  if (lower === "en" || lower.startsWith("en-")) return "en";
  return "en";
}
