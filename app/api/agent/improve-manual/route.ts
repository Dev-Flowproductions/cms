import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser, getUserRoles, hasAdminRole } from "@/lib/auth";
import { improveManualField } from "@/lib/agent/improve-manual-field";
import type { Locale } from "@/lib/types/db";

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
    field: "title" | "content";
    title?: string;
    content_md?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { author_user_id, locale, field, title = "", content_md = "" } = body;
  if (!author_user_id || !locale || (field !== "title" && field !== "content")) {
    return NextResponse.json({ error: "author_user_id, locale, and field are required" }, { status: 400 });
  }
  if (locale !== "pt" && locale !== "en" && locale !== "fr") {
    return NextResponse.json({ error: "locale must be pt, en, or fr" }, { status: 400 });
  }
  if (field === "title" && !title.trim() && !content_md.trim()) {
    return NextResponse.json({ error: "Provide a title or content to improve" }, { status: 400 });
  }
  if (field === "content" && !content_md.trim()) {
    return NextResponse.json({ error: "Content is empty" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select("company_name, brand_name, custom_instructions")
    .eq("user_id", author_user_id)
    .maybeSingle();

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  try {
    const result = await improveManualField({
      field,
      locale: locale as Locale,
      title: title.trim(),
      content_md,
      brandName: client.company_name ?? client.brand_name,
      customInstructions: client.custom_instructions,
    });
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Improvement failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
