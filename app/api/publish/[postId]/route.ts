import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildRevalidationPayload, buildWebhookHeaders, resolveWebhookEvent } from "@/lib/cms-api/webhooks";
import { publishSeoScoreGate } from "@/lib/agent/score-post";
import { stripAuthorBlocksFromContentMd } from "@/lib/agent/internal-link";
import { resolveAuthorForByline } from "@/lib/data/blog-authors";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  // Allow internal scheduler calls (no user session needed)
  const isInternalCall = _req.headers.get("x-scheduler-internal") === "1";

  if (!isInternalCall) {
    const supabase = await createClient();

    // Verify the caller is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins may push manually
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .single();
    if (roleRow?.role_id !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Fetch the post + its active localization + the owner's client webhook config
  const admin = createAdminClient();
  const { data: post, error: postError } = await admin
    .from("posts")
    .select(`
      id, slug, author_id, byline_author_id, status, updated_at, webhook_status, primary_locale,
      post_localizations (
        locale, title, excerpt, content_md, seo_title, seo_description, jsonld, seo_score
      ),
      cover_image_path
    `)
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Fetch the author's client webhook config (include client id for siteId)
  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("id, webhook_url, webhook_secret, webhook_event_format, auto_publish, domain")
    .eq("user_id", post.author_id)
    .maybeSingle();

  if (clientError || !client) {
    return NextResponse.json({ error: "No client configuration found for this post's author." }, { status: 404 });
  }

  if (!client.webhook_url) {
    return NextResponse.json(
      { error: "This client has not configured a publish webhook URL. Ask them to add it in their account settings." },
      { status: 422 }
    );
  }

  const bylineResolved = await resolveAuthorForByline(
    admin,
    post.author_id,
    (post as { byline_author_id?: string | null }).byline_author_id ?? null,
  );
  const author = bylineResolved
    ? {
        name: bylineResolved.displayName,
        jobTitle: bylineResolved.jobTitle,
        bio: bylineResolved.bio,
        avatarUrl: bylineResolved.avatarUrl,
      }
    : null;

  // Build the cover image public URL if available
  let coverImageUrl: string | null = null;
  if (post.cover_image_path) {
    const { data: urlData } = admin.storage
      .from("covers")
      .getPublicUrl(post.cover_image_path);
    coverImageUrl = urlData?.publicUrl ?? null;
  }

  const localizations = post.post_localizations ?? [];

  // Clean content_md for each localization (replace/remove cover placeholder, strip duplicate H1)
  const COVER_PLACEHOLDER_RE = /!\[Cover image\]\(\{COVER_IMAGE_PLACEHOLDER\}\)\n?/g;
  const cleanedLocalizations = localizations.map((l: {
    locale: string;
    title: string | null;
    excerpt: string | null;
    content_md: string | null;
    seo_title: string | null;
    seo_description: string | null;
    jsonld: unknown;
    seo_score: unknown;
  }) => ({
    ...l,
    // Strip cover placeholder and HTML author block — website renders author from post.author, not from embedded HTML
    content_md: stripAuthorBlocksFromContentMd(
      (l.content_md ?? "")
        .replace(COVER_PLACEHOLDER_RE, coverImageUrl ? `![Cover image](${coverImageUrl})\n` : "")
        .trim()
    ),
  }));

  const primaryLocale = (post as { primary_locale?: string }).primary_locale ?? "pt";
  const gate = publishSeoScoreGate({
    primaryLocale,
    localizations: cleanedLocalizations,
  });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: 422 });
  }

  const primary =
    cleanedLocalizations.find((l) => l.locale === primaryLocale) ??
    cleanedLocalizations.find((l) => l.locale === "pt") ??
    cleanedLocalizations.find((l) => l.locale === "en") ??
    cleanedLocalizations[0];

  if (!primary) {
    return NextResponse.json({ error: "Post has no content." }, { status: 422 });
  }

  // Always provide the structured author object — HTML author block is stripped from content_md above.
  // The website renders the author from post.author, not from embedded HTML in the markdown.
  const authorPayload = author;

  const isUpdate = (post as { webhook_status?: string }).webhook_status === "success";
  const format = (client as { webhook_event_format?: "spec" | "legacy" | null }).webhook_event_format ?? "spec";
  const event = resolveWebhookEvent(format, isUpdate);

  const revalidation = buildRevalidationPayload(event, client.id, {
    id: post.id,
    slug: post.slug,
    status: "published",
    updatedAt: (post as { updated_at: string }).updated_at,
  });

  const payload = {
    ...revalidation,
    post: {
      ...revalidation.post,
      cover_image_url: coverImageUrl,
      ...(authorPayload !== undefined ? { author: authorPayload } : {}),
      title: primary.title,
      excerpt: primary.excerpt,
      content_md: primary.content_md,
      seo_title: primary.seo_title,
      meta_description: primary.seo_description,
      json_ld: primary.jsonld ?? null,
      locale: primary.locale,
      translations: Object.fromEntries(
        cleanedLocalizations.map((l) => [
          l.locale,
          {
            title: l.title,
            excerpt: l.excerpt,
            content_md: l.content_md,
            seo_title: l.seo_title,
            meta_description: l.seo_description,
            json_ld: l.jsonld ?? null,
          },
        ])
      ),
    },
  };

  // Mark as pending before attempting
  await admin
    .from("posts")
    .update({
      webhook_status: "pending",
      webhook_sent_at: new Date().toISOString(),
      webhook_error: null,
    })
    .eq("id", postId);

  try {
    const headers = client.webhook_secret
      ? buildWebhookHeaders(payload, client.webhook_secret, event)
      : { "Content-Type": "application/json" };
    if (client.webhook_secret) {
      (headers as Record<string, string>)["x-webhook-secret"] = client.webhook_secret;
    }

    const response = await fetch(client.webhook_url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const errorMsg = `Webhook responded with ${response.status}: ${body.slice(0, 200)}`;

      await admin
        .from("posts")
        .update({
          webhook_status: "failed",
          webhook_error: errorMsg,
        })
        .eq("id", postId);

      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    // Success — also set post status to published
    await admin
      .from("posts")
      .update({
        status: "published",
        webhook_status: "success",
        webhook_sent_at: new Date().toISOString(),
        webhook_error: null,
      })
      .eq("id", postId);

    return NextResponse.json({ success: true, deliveredAt: new Date().toISOString() });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    await admin
      .from("posts")
      .update({
        webhook_status: "failed",
        webhook_error: errorMsg,
      })
      .eq("id", postId);

    return NextResponse.json({ error: errorMsg }, { status: 502 });
  }
}
