import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateClientSpecificInstructions } from "@/lib/agent/generate-client-instructions";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: client } = await admin
    .from("clients")
    .select("domain, company_name, brand_name, brand_tone, brand_book, primary_color, secondary_color, tertiary_color, font_style, brand_voice, logo_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (client) {
    const customInstructions = generateClientSpecificInstructions(client);
    await admin
      .from("clients")
      .update({
        custom_instructions: customInstructions || null,
        config_pending_admin: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("onboarding_done", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    sameSite: "lax",
  });

  return response;
}
