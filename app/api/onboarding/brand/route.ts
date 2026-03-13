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

  const formData = await request.formData();
  const domain = formData.get("domain")?.toString().trim().toLowerCase().replace(/^https?:\/\//, "");
  const companyName = formData.get("companyName")?.toString().trim();
  const primaryColor = formData.get("primaryColor")?.toString() ?? "#7c5cfc";
  const secondaryColor = formData.get("secondaryColor")?.toString() ?? "#22d3a0";
  const fontStyle = formData.get("fontStyle")?.toString() ?? "modern";
  const brandVoice = formData.get("brandVoice")?.toString() ?? "professional";
  const logoFile = formData.get("logo") as File | null;

  if (!domain || !companyName) {
    return NextResponse.json({ error: "Domain and company name are required" }, { status: 400 });
  }

  // Check if domain is taken by another user
  const admin = createAdminClient();
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
            colorPalette: `Primary: ${primaryColor}, Secondary: ${secondaryColor}. ${result.brandBook.visualIdentity.colorPalette}`,
            aestheticStyle: `${fontStyle} style. ${result.brandBook.visualIdentity.aestheticStyle}`,
          },
        };

        await admin
          .from("clients")
          .update({
            brand_book: mergedBrandBook,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        console.log(`[onboarding/brand] Brand book generated for ${companyName} (${domain})`);
      }
    })
    .catch((err) => {
      console.error(`[onboarding/brand] Brand book error for ${domain}:`, err);
    });

  return NextResponse.json({ success: true });
}
