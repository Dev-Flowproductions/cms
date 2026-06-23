import { NextResponse } from "next/server";
import { getUser, getUserRoles, hasAdminRole } from "@/lib/auth";
import { optimizeManualPost } from "@/lib/agent/optimize-manual-post";
import type { Locale } from "@/lib/types/db";

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await getUserRoles(user.id);
  if (!hasAdminRole(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    post_id: string;
    locale: string;
    title?: string;
    content_md?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { post_id, locale, title = "", content_md = "" } = body;
  if (!post_id || !locale) {
    return NextResponse.json({ error: "post_id and locale are required" }, { status: 400 });
  }
  if (locale !== "pt" && locale !== "en" && locale !== "fr") {
    return NextResponse.json({ error: "locale must be pt, en, or fr" }, { status: 400 });
  }

  const result = await optimizeManualPost({
    postId: post_id,
    locale: locale as Locale,
    title,
    content_md,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode ?? 500 });
  }

  return NextResponse.json({ success: true, ...result });
}
