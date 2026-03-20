import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBrandBook } from "@/lib/brand-book/generate";
import { generateClientSpecificInstructions } from "@/lib/agent/generate-client-instructions";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const domain = formData.get("domain")?.toString().trim().toLowerCase().replace(/^https?:\/\//, "");
  const companyName = formData.get("companyName")?.toString().trim();
  const primaryColor = formData.get("primaryColor")?.toString() ?? "#7c5cfc";
  const secondaryColor = formData.get("secondaryColor")?.toString() ?? "#22d3a0";
  const tertiaryColor = formData.get("tertiaryColor")?.toString() ?? null;
  const fontStyle = formData.get("fontStyle")?.toString() ?? "modern";
  const brandVoice = formData.get("brandVoice")?.toString() ?? "professional";
  const logoFile = formData.get("logo") as File | null;

  if (!domain || !companyName) {
    return NextResponse.json({ error: "Domain and company name are required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Ensure client row exists (onboarding may run before admin has created it, or row was missing)
  const { data: existingClient } = await admin
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingClient) {
    const { error: insertErr } = await admin.from("clients").insert({
      user_id: user.id,
      domain: null,
      frequency: "weekly",
    });
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }
  }

  // Check if domain is taken by another user
  const { data: existing } = await admin
    .from("clients")
    .select("user_id")
    .eq("domain", domain)
    .maybeSingle();

  if (existing && existing.user_id !== user.id) {
    return NextResponse.json({ error: "domain_taken" }, { status: 409 });
  }

  // Upload logo if provided
  let logoUrl: string | null = null;
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split(".").pop() ?? "png";
    const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await admin.storage
      .from("logos")
      .upload(fileName, logoFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrl } = admin.storage.from("logos").getPublicUrl(fileName);
      logoUrl = publicUrl.publicUrl;
    } else {
      console.error("[onboarding/brand] Logo upload failed:", uploadError);
    }
  }

  // Update client record
  const { error } = await supabase
    .from("clients")
    .update({
      domain,
      company_name: companyName,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      tertiary_color: tertiaryColor,
      font_style: fontStyle,
      brand_voice: brandVoice,
      brand_name: companyName,
      brand_tone: brandVoice,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const customInstructions = generateClientSpecificInstructions({
    domain,
    company_name: companyName,
    brand_name: companyName,
    brand_tone: brandVoice,
    brand_book: null,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    tertiary_color: tertiaryColor,
    font_style: fontStyle,
    brand_voice: brandVoice,
    logo_url: logoUrl,
  });
  await admin.from("clients").update({ custom_instructions: customInstructions || null }).eq("user_id", user.id);

  // Generate brand book in background using user-provided info + website analysis
  generateBrandBook(domain)
    .then(async (result) => {
      if (result.success && result.brandBook) {
        // Merge user-provided info into the generated brand book
        const mergedBrandBook = {
          ...result.brandBook,
          brandName: companyName,
          voiceAttributes: [brandVoice, ...result.brandBook.voiceAttributes.filter(v => v !== brandVoice)],
          visualIdentity: {
            ...result.brandBook.visualIdentity,
            colorPalette: `Primary: ${primaryColor}, Secondary: ${secondaryColor}${tertiaryColor ? `, Tertiary: ${tertiaryColor}` : ""}. ${result.brandBook.visualIdentity.colorPalette}`,
            aestheticStyle: `${fontStyle} style. ${result.brandBook.visualIdentity.aestheticStyle}`,
          },
        };

        const { data: updated } = await admin
          .from("clients")
          .update({
            brand_book: mergedBrandBook,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select("domain, company_name, brand_name, brand_tone, brand_book, primary_color, secondary_color, tertiary_color, font_style, brand_voice, logo_url")
          .single();
        if (updated) {
          const instructions = generateClientSpecificInstructions(updated);
          await admin.from("clients").update({ custom_instructions: instructions || null }).eq("user_id", user.id);
        }
        console.log(`[onboarding/brand] Brand book generated for ${companyName} (${domain})`);
      }
    })
    .catch((err) => {
      console.error(`[onboarding/brand] Brand book error for ${domain}:`, err);
    });

  return NextResponse.json({ success: true });
}
