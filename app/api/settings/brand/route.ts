import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const companyName = formData.get("companyName")?.toString().trim() ?? "";
  const primaryColor = formData.get("primaryColor")?.toString() ?? "#7c5cfc";
  const secondaryColor = formData.get("secondaryColor")?.toString() ?? "#22d3a0";
  const fontStyle = formData.get("fontStyle")?.toString().trim() || "modern";
  const brandVoice = formData.get("brandVoice")?.toString() ?? "professional";
  const logoFile = formData.get("logo") as File | null;

  let logoUrl: string | null | undefined = undefined;
  if (logoFile && logoFile.size > 0) {
    const admin = createAdminClient();
    const fileExt = logoFile.name.split(".").pop() ?? "png";
    const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await admin.storage
      .from("logos")
      .upload(fileName, logoFile, { cacheControl: "3600", upsert: true });

    if (!uploadError) {
      const { data: publicUrl } = admin.storage.from("logos").getPublicUrl(fileName);
      logoUrl = publicUrl.publicUrl;
    }
  }

  const updatePayload: Record<string, unknown> = {
    company_name: companyName || null,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    font_style: fontStyle,
    brand_voice: brandVoice,
    brand_name: companyName || null,
    brand_tone: brandVoice,
    updated_at: new Date().toISOString(),
  };
  if (logoUrl !== undefined) {
    updatePayload.logo_url = logoUrl;
  }

  const { error } = await supabase
    .from("clients")
    .update(updatePayload)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
