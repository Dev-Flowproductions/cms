import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser, getUserRoles, hasAdminRole } from "@/lib/auth";
import { inngest } from "@/lib/inngest/client";
import { executeAgentGeneratePost } from "@/lib/agent/execute-generate-post";
import type { Locale } from "@/lib/types/db";

/**
 * Admin-only: re-enqueue DG brief article generation (Inngest `cms/dg-brief.run-generation`)
 * for a stuck `idea` post, e.g. when the event was never delivered.
 *
 * Body: `{ "request_id": "<uuid>" }` or `{ "post_id": "<uuid>" }` (one required).
 */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const roles = await getUserRoles(user.id);
  if (!hasAdminRole(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { request_id?: string; post_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requestId = body.request_id?.trim();
  const postIdIn = body.post_id?.trim();
  if (!requestId && !postIdIn) {
    return NextResponse.json(
      { error: "Provide request_id or post_id" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  let postId: string;
  let focusKeyword: string | undefined;

  if (requestId) {
    const { data: dgRow, error: dgErr } = await admin
      .from("dg_integration_records")
      .select("post_id, primary_keyword, language")
      .eq("request_id", requestId)
      .maybeSingle();

    if (dgErr) {
      return NextResponse.json({ error: dgErr.message }, { status: 500 });
    }
    if (!dgRow?.post_id) {
      return NextResponse.json(
        {
          error: "No dg_integration_records row found for this request_id",
          hint:
            "Confirm the UUID in Supabase → public.dg_integration_records.request_id (production). If the post exists but the DG row is missing or the id differs, call again with { post_id: \"<posts.id>\" } instead.",
          searched: { request_id: requestId },
        },
        { status: 404 },
      );
    }
    postId = dgRow.post_id as string;
    focusKeyword =
      typeof dgRow.primary_keyword === "string" && dgRow.primary_keyword.trim()
        ? dgRow.primary_keyword.trim()
        : undefined;
  } else {
    postId = postIdIn as string;
    const { data: dgRow } = await admin
      .from("dg_integration_records")
      .select("primary_keyword")
      .eq("post_id", postId)
      .maybeSingle();
    if (typeof dgRow?.primary_keyword === "string" && dgRow.primary_keyword.trim()) {
      focusKeyword = dgRow.primary_keyword.trim();
    }
  }

  const { data: post, error: postErr } = await admin
    .from("posts")
    .select("id, primary_locale, status")
    .eq("id", postId)
    .maybeSingle();

  if (postErr || !post) {
    return NextResponse.json(
      {
        error: "Post not found",
        hint: "Check that post_id is a valid public.posts.id.",
        searched: { post_id: postId },
      },
      { status: 404 },
    );
  }

  const locale = (post.primary_locale ?? "en") as Locale;

  if (focusKeyword === undefined) {
    const { data: loc } = await admin
      .from("post_localizations")
      .select("focus_keyword")
      .eq("post_id", postId)
      .eq("locale", locale)
      .maybeSingle();
    if (typeof loc?.focus_keyword === "string" && loc.focus_keyword.trim()) {
      focusKeyword = loc.focus_keyword.trim();
    }
  }

  try {
    await inngest.send({
      name: "cms/dg-brief.run-generation",
      data: {
        postId,
        locale,
        focusKeyword,
      },
    });
  } catch (e) {
    console.error("[dg] trigger-brief-generation: Inngest send failed:", e);
    const result = await executeAgentGeneratePost({
      postId,
      locale,
      focusKeyword,
      dgBrief: true,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, fallback: "inline_generation_failed" },
        { status: 500 },
      );
    }
    return NextResponse.json({
      ok: true,
      post_id: postId,
      locale,
      mode: "inline_fallback",
      post_status_before: post.status,
    });
  }

  return NextResponse.json({
    ok: true,
    post_id: postId,
    locale,
    mode: "inngest",
    post_status_before: post.status,
  });
}
