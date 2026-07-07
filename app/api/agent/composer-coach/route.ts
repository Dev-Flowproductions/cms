import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser, getUserRoles, hasAdminRole } from "@/lib/auth";
import { getComposerWritingTips } from "@/lib/agent/composer-writing-coach";
import type { Locale } from "@/lib/types/db";

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roles = await getUserRoles(user.id);
  if (!hasAdminRole(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    author_user_id: string;
    locale: string;
    title?: string;
    content_md?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { author_user_id, locale, title = "", content_md = "" } = body;
  if (!author_user_id || !locale) {
    return NextResponse.json({ error: "author_user_id and locale are required" }, { status: 400 });
  }
  if (locale !== "pt" && locale !== "en" && locale !== "fr") {
    return NextResponse.json({ error: "locale must be pt, en, or fr" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select("company_name, brand_name")
    .eq("user_id", author_user_id)
    .maybeSingle();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  try {
    const tips = await getComposerWritingTips({
      locale: locale as Locale,
      title,
      content_md,
      brandName: client.company_name ?? client.brand_name,
    });
    return NextResponse.json({ success: true, tips });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Coach unavailable";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
