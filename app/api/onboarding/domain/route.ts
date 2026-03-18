import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBrandBook } from "@/lib/brand-book/generate";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const domain = body?.domain?.toString().trim().toLowerCase().replace(/^https?:\/\//, "");

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Ensure client row exists
  const { data: existingClient } = await admin
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingClient) {
    const { data: domainTaken } = await admin
      .from("clients")
      .select("user_id")
      .eq("domain", domain)
      .maybeSingle();
    if (domainTaken) {
      return NextResponse.json({ error: "domain_taken" }, { status: 409 });
    }
    const { error: insertErr } = await admin.from("clients").insert({
      user_id: user.id,
      domain,
      frequency: "weekly",
    });
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
  } else {
    // Check if domain is taken by another user
    const { data: existing } = await admin
      .from("clients")
      .select("user_id")
      .eq("domain", domain)
      .maybeSingle();

    if (existing && existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "domain_taken" },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("clients")
      .update({ domain })
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Generate brand book in background (don't block onboarding)
  generateBrandBook(domain)
    .then(async (result) => {
      if (result.success && result.brandBook) {
        await admin
          .from("clients")
          .update({
            brand_book: result.brandBook,
            brand_name: result.brandBook.brandName,
            brand_tone: result.brandBook.voiceAttributes.join(", "),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        console.log(`[onboarding] Brand book generated for ${domain}`);
      } else {
        console.error(`[onboarding] Brand book failed for ${domain}:`, result.error);
      }
    })
    .catch((err) => {
      console.error(`[onboarding] Brand book error for ${domain}:`, err);
    });

  return NextResponse.json({ success: true });
}
