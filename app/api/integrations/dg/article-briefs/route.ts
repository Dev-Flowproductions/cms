import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickRandomBylineAuthorId } from "@/lib/data/blog-authors";
import {
  dgArticleBriefRequestSchema,
  normalizeDgLanguage,
} from "@/lib/integrations/dg/article-brief-schema";
import { buildDgArticleAdminUrl } from "@/lib/integrations/dg/urls";
import { notifyDgArticleStatusIfLinked } from "@/lib/integrations/dg/notify";
import { inngest } from "@/lib/inngest/client";
import { executeAgentGeneratePost } from "@/lib/agent/execute-generate-post";

export const maxDuration = 60;

function jsonError(
  status: number,
  error_code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ success: false, error_code, message }, { status });
}

export async function POST(req: NextRequest) {
  const secret = process.env.DG_INTEGRATION_BEARER_SECRET?.trim();
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonError(401, "INVALID_TOKEN", "Unauthorized");
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonError(400, "VALIDATION_ERROR", "Invalid JSON body");
  }

  const parsed = dgArticleBriefRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg =
      parsed.error.issues.map((e) => e.message).join("; ") || "Validation failed";
    return jsonError(422, "VALIDATION_ERROR", msg);
  }

  const body = parsed.data;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("dg_integration_records")
    .select("post_id, cms_site_id, created_at")
    .eq("request_id", body.request_id)
    .maybeSingle();

  if (existing?.post_id) {
    const { data: post } = await admin
      .from("posts")
      .select("primary_locale")
      .eq("id", existing.post_id)
      .maybeSingle();
    const locale = post?.primary_locale ?? "en";
    return NextResponse.json({
      success: true,
      cms_article_id: existing.post_id,
      cms_site_id: body.cms_site_id,
      status: "queued",
      status_label: "Queued",
      article_admin_url: buildDgArticleAdminUrl(existing.post_id, locale),
      received_at: existing.created_at ?? new Date().toISOString(),
    });
  }

  const { data: client, error: clientErr } = await admin
    .from("clients")
    .select("id, user_id")
    .eq("id", body.cms_site_id)
    .maybeSingle();

  if (clientErr || !client) {
    return jsonError(
      404,
      "SITE_NOT_FOUND",
      "The provided cms_site_id does not exist or is not available for DG integration.",
    );
  }

  const primaryLocale = normalizeDgLanguage(body.language);
  const title = body.title?.trim() || "Untitled";
  const bylineAuthorId = await pickRandomBylineAuthorId(admin, client.user_id).catch(() => null);

  const slug = `dg-${body.request_id.replace(/-/g, "").slice(0, 16)}-${Date.now().toString(36)}`;

  const { data: post, error: postErr } = await admin
    .from("posts")
    .insert({
      slug,
      primary_locale: primaryLocale,
      content_type: "hub",
      status: "idea",
      author_id: client.user_id,
      ...(bylineAuthorId ? { byline_author_id: bylineAuthorId } : {}),
    })
    .select("id, created_at")
    .single();

  if (postErr || !post) {
    return jsonError(
      500,
      "VALIDATION_ERROR",
      postErr?.message ?? "Failed to create post",
    );
  }

  const { error: locErr } = await admin.from("post_localizations").insert({
    post_id: post.id,
    locale: primaryLocale,
    title,
    excerpt: "",
    content_md: body.brief_md,
  });

  if (locErr) {
    await admin.from("posts").delete().eq("id", post.id);
    return jsonError(500, "VALIDATION_ERROR", locErr.message);
  }

  const { data: dgRec, error: dgErr } = await admin
    .from("dg_integration_records")
    .insert({
      request_id: body.request_id,
      dg_workspace_id: body.dg_workspace_id ?? null,
      dg_client_id: body.dg_client_id ?? null,
      dg_project_id: body.dg_project_id,
      dg_strategy_id: body.dg_strategy_id,
      dg_campaign_id: body.dg_campaign_id ?? null,
      cms_site_id: client.id,
      post_id: post.id,
      brief_title: title,
      brief_md: body.brief_md,
      language: body.language,
      primary_keyword: body.primary_keyword ?? null,
      dg_payload: body as unknown as Record<string, unknown>,
    })
    .select("id, created_at")
    .single();

  if (dgErr || !dgRec) {
    await admin.from("post_localizations").delete().eq("post_id", post.id);
    await admin.from("posts").delete().eq("id", post.id);

    if (dgErr?.code === "23505") {
      const { data: raced } = await admin
        .from("dg_integration_records")
        .select("post_id, created_at")
        .eq("request_id", body.request_id)
        .maybeSingle();
      if (raced?.post_id) {
        const { data: postRow } = await admin
          .from("posts")
          .select("primary_locale")
          .eq("id", raced.post_id)
          .maybeSingle();
        const locale = postRow?.primary_locale ?? "en";
        return NextResponse.json({
          success: true,
          cms_article_id: raced.post_id,
          cms_site_id: body.cms_site_id,
          status: "queued",
          status_label: "Queued",
          article_admin_url: buildDgArticleAdminUrl(raced.post_id, locale),
          received_at: raced.created_at ?? new Date().toISOString(),
        });
      }
    }

    return jsonError(
      500,
      "VALIDATION_ERROR",
      dgErr?.message ?? "Failed to persist DG record",
    );
  }

  void notifyDgArticleStatusIfLinked(post.id);

  try {
    await inngest.send({
      name: "cms/dg-brief.run-generation",
      data: {
        postId: post.id,
        locale: primaryLocale,
        focusKeyword: body.primary_keyword ?? undefined,
      },
    });
  } catch (inngestErr) {
    console.error("[dg] Inngest enqueue for generation failed:", inngestErr);
    void executeAgentGeneratePost({
      postId: post.id,
      locale: primaryLocale,
      focusKeyword: body.primary_keyword ?? undefined,
      dgBrief: true,
    }).catch((genErr) => {
      console.error("[dg] Fallback inline generation failed:", genErr);
    });
  }

  return NextResponse.json({
    success: true,
    cms_article_id: post.id,
    cms_site_id: body.cms_site_id,
    status: "queued",
    status_label: "Queued",
    article_admin_url: buildDgArticleAdminUrl(post.id, primaryLocale),
    received_at: dgRec.created_at ?? new Date().toISOString(),
  });
}
