import { createAdminClient } from "@/lib/supabase/admin";

export interface SiteAuthResult {
  clientId: string;
  userId: string;
  domain: string | null;
  blogBasePath: string;
}

/**
 * Validates API key for a site (client).
 * Key can be the client's cms_api_key or webhook_secret (fallback).
 * Returns site info if valid, null otherwise.
 */
export async function validateSiteApiKey(
  siteId: string,
  apiKey: string | null
): Promise<SiteAuthResult | null> {
  if (!apiKey?.trim()) return null;

  const admin = createAdminClient();
  const { data: client, error } = await admin
    .from("clients")
    .select("id, user_id, domain, blog_base_path, cms_api_key, webhook_secret")
    .eq("id", siteId)
    .maybeSingle();

  if (error || !client) return null;

  const key = apiKey.trim();
  const matches =
    (client.cms_api_key && client.cms_api_key === key) ||
    (client.webhook_secret && client.webhook_secret === key);

  if (!matches) return null;

  return {
    clientId: client.id,
    userId: client.user_id,
    domain: client.domain,
    blogBasePath: client.blog_base_path ?? "/blog",
  };
}

/**
 * Extract API key from request: Authorization Bearer or x-api-key header
 */
export function getApiKeyFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return request.headers.get("x-api-key")?.trim() ?? null;
}
