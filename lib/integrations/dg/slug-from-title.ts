import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * SEO slug from a human title: lowercase, hyphens, ASCII, max length (matches manual post creation).
 */
export function buildSeoSlugFromTitle(title: string): string {
  const raw = title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return raw || "post";
}

/**
 * Reserves a unique `posts.slug`: tries `baseSlug`, then `baseSlug-2`, `baseSlug-3`, … then a short random suffix.
 */
export async function pickUniquePostSlug(admin: AdminClient, baseSlug: string): Promise<string> {
  const normalized = buildSeoSlugFromTitle(baseSlug).slice(0, 80);
  for (let i = 0; i < 80; i++) {
    const suffix = i === 0 ? "" : `-${i + 1}`;
    const maxStem = Math.max(1, 80 - suffix.length);
    const stem = normalized.slice(0, maxStem);
    const candidate = `${stem}${suffix}`;
    const { data } = await admin.from("posts").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${normalized.slice(0, 72)}-${Math.random().toString(36).slice(2, 8)}`;
}
