import type { AuthorForBlock } from "@/lib/agent/internal-link";
import { extractAuthorFieldsFromContentMd, mergeAuthorWithContentMd } from "@/lib/agent/internal-link";

export type BlogAuthorRow = {
  id: string;
  user_id: string;
  display_name: string;
  job_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  sort_order: number;
  created_at: string;
};

type AdminClient = ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>;

export function blogAuthorRowToForBlock(row: BlogAuthorRow): AuthorForBlock {
  return {
    displayName: row.display_name?.trim() || null,
    jobTitle: row.job_title?.trim() ?? null,
    bio: row.bio?.trim() ?? null,
    avatarUrl: row.avatar_url?.trim() ?? null,
  };
}

/**
 * Byline for markdown + webhooks: blog author row if post.byline_author_id matches owner, else profile.
 */
export async function resolveAuthorForByline(
  admin: AdminClient,
  postAuthorId: string,
  bylineAuthorId: string | null | undefined
): Promise<AuthorForBlock | null> {
  if (bylineAuthorId) {
    const { data: row } = await admin
      .from("blog_authors")
      .select("id, user_id, display_name, job_title, bio, avatar_url, sort_order, created_at")
      .eq("id", bylineAuthorId)
      .maybeSingle();
    const ba = row as BlogAuthorRow | null;
    if (ba && ba.user_id === postAuthorId && ba.display_name?.trim()) {
      return blogAuthorRowToForBlock(ba);
    }
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, job_title, bio, avatar_url")
    .eq("id", postAuthorId)
    .maybeSingle();
  if (!profile?.display_name?.trim()) return null;
  return {
    displayName: profile.display_name.trim(),
    jobTitle: profile.job_title?.trim() ?? null,
    bio: profile.bio?.trim() ?? null,
    avatarUrl: profile.avatar_url?.trim() ?? null,
  };
}

export async function pickRandomBylineAuthorId(admin: AdminClient, userId: string): Promise<string | null> {
  const { data: rows, error } = await admin
    .from("blog_authors")
    .select("id")
    .eq("user_id", userId);
  if (error || !rows?.length) return null;
  const i = Math.floor(Math.random() * rows.length);
  return (rows[i] as { id: string }).id;
}

type LocalizationRow = { locale: string; content_md: string | null };

type AuthorIdentityContext = {
  fromDb: AuthorForBlock | null;
  blogAuthors: BlogAuthorRow[];
  profile: {
    display_name?: string | null;
    job_title?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  } | null;
};

async function loadAuthorIdentityContext(
  admin: AdminClient,
  postAuthorId: string,
  bylineAuthorId: string | null | undefined,
): Promise<AuthorIdentityContext> {
  const fromDb = await resolveAuthorForByline(admin, postAuthorId, bylineAuthorId);
  const [{ data: authors }, { data: profile }] = await Promise.all([
    admin
      .from("blog_authors")
      .select("id, user_id, display_name, job_title, bio, avatar_url, sort_order, created_at")
      .eq("user_id", postAuthorId),
    admin
      .from("profiles")
      .select("display_name, job_title, bio, avatar_url")
      .eq("id", postAuthorId)
      .maybeSingle(),
  ]);
  return {
    fromDb,
    blogAuthors: (authors ?? []) as BlogAuthorRow[],
    profile: profile ?? null,
  };
}

/** Resolve author job/bio/name for one localization's embedded author card. */
export function resolveAuthorForContentMd(
  ctx: AuthorIdentityContext,
  contentMd: string,
): AuthorForBlock | null {
  const extracted = extractAuthorFieldsFromContentMd(contentMd);
  const extName = extracted.displayName?.trim();
  if (!extName) return mergeAuthorWithContentMd(ctx.fromDb, contentMd);

  const matchBa = ctx.blogAuthors.find(
    (r) => r.display_name?.trim().toLowerCase() === extName.toLowerCase(),
  );
  if (matchBa) {
    const block = blogAuthorRowToForBlock(matchBa);
    return {
      displayName: extName,
      jobTitle: extracted.jobTitle?.trim() || block.jobTitle,
      bio: extracted.bio?.trim() || block.bio,
      avatarUrl: block.avatarUrl,
    };
  }

  if (ctx.profile?.display_name?.trim().toLowerCase() === extName.toLowerCase()) {
    return {
      displayName: extName,
      jobTitle: extracted.jobTitle?.trim() || ctx.profile.job_title?.trim() || null,
      bio: extracted.bio?.trim() || ctx.profile.bio?.trim() || null,
      avatarUrl: ctx.profile.avatar_url?.trim() || null,
    };
  }

  return mergeAuthorWithContentMd(ctx.fromDb, contentMd) ?? ctx.fromDb;
}

/**
 * Webhook / consumer `post.author` should match what readers see in the primary locale body.
 * If the embedded "About the author" card names someone who exists as a blog author or the
 * account profile (case-insensitive), use that identity with the **name spelling from the
 * markdown** so it matches the editor. Otherwise falls back to {@link resolveAuthorForByline}.
 */
export async function resolveAuthorForWebhookDelivery(
  admin: AdminClient,
  postAuthorId: string,
  bylineAuthorId: string | null | undefined,
  primaryLocale: string,
  localizations: LocalizationRow[],
): Promise<AuthorForBlock | null> {
  const ctx = await loadAuthorIdentityContext(admin, postAuthorId, bylineAuthorId);
  const primaryLoc =
    localizations.find((l) => l.locale === primaryLocale) ??
    localizations.find((l) => l.locale === "pt") ??
    localizations.find((l) => l.locale === "en") ??
    localizations[0];
  return resolveAuthorForContentMd(ctx, primaryLoc?.content_md ?? "");
}

export async function resolveAuthorsForWebhookLocalizations(
  admin: AdminClient,
  postAuthorId: string,
  bylineAuthorId: string | null | undefined,
  localizations: LocalizationRow[],
): Promise<Record<string, AuthorForBlock | null>> {
  const ctx = await loadAuthorIdentityContext(admin, postAuthorId, bylineAuthorId);
  const out: Record<string, AuthorForBlock | null> = {};
  for (const loc of localizations) {
    if (!loc.locale) continue;
    out[loc.locale] = resolveAuthorForContentMd(ctx, loc.content_md ?? "");
  }
  return out;
}

export function authorForBlockToWebhookAuthor(
  a: AuthorForBlock | null,
): { name: string; jobTitle: string | null; bio: string | null; avatarUrl: string | null } | null {
  if (!a?.displayName?.trim()) return null;
  return {
    name: a.displayName.trim(),
    jobTitle: a.jobTitle ?? null,
    bio: a.bio ?? null,
    avatarUrl: a.avatarUrl ?? null,
  };
}
