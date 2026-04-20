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

  const dgRes = requestId
    ? await admin
        .from("dg_integration_records")
        .select("post_id, primary_keyword, language")
        .eq("request_id", requestId)
        .maybeSingle()
    : await admin
        .from("dg_integration_records")
        .select("post_id, primary_keyword, language")
        .eq("post_id", postIdIn as string)
        .maybeSingle();
  const { data: dgRow, error: dgErr } = dgRes;

  if (dgErr) {
    return NextResponse.json({ error: dgErr.message }, { status: 500 });
  }
  if (!dgRow?.post_id) {
    return NextResponse.json(
      { error: "No dg_integration_records row found for this id" },
      { status: 404 },
    );
  }

  const postId = dgRow.post_id as string;

  const { data: post, error: postErr } = await admin
    .from("posts")
    .select("id, primary_locale, status")
    .eq("id", postId)
    .maybeSingle();

  if (postErr || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const locale = (post.primary_locale ?? "en") as Locale;
  const focusKeyword =
    typeof dgRow.primary_keyword === "string" && dgRow.primary_keyword.trim()
      ? dgRow.primary_keyword.trim()
      : undefined;

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
