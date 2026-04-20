import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeAgentGeneratePost } from "@/lib/agent/execute-generate-post";
import type { Locale } from "@/lib/types/db";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { post_id: string; locale: string; focus_keyword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { post_id, locale, focus_keyword } = body;
  if (!post_id || !locale) {
    return NextResponse.json({ error: "post_id and locale are required" }, { status: 400 });
  }
  if (locale !== "pt" && locale !== "en" && locale !== "fr") {
    return NextResponse.json({ error: "locale must be pt, en, or fr" }, { status: 400 });
  }
  const localeTyped = locale as Locale;

  const result = await executeAgentGeneratePost({
    postId: post_id,
    locale: localeTyped,
    focusKeyword: focus_keyword,
    dgBrief: false,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.statusCode ?? 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    coverPublicUrl: result.coverPublicUrl,
    seoScore: result.seoScore,
  });
}
