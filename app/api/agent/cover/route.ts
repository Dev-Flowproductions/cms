import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { post_id: string; query: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { post_id, query } = body;
  if (!post_id || !query) {
    return NextResponse.json({ error: "post_id and query are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  let imageBuffer!: ArrayBuffer | Buffer;
  let contentType = "image/jpeg";
  let source = "gemini";

  // Load client brand (post -> author_id = user_id -> client row)
  let brandStyle = "";
  const { data: postRow } = await admin.from("posts").select("author_id").eq("id", post_id).maybeSingle();
  if (postRow?.author_id) {
    const { data: clientRow } = await admin
      .from("clients")
      .select("primary_color, secondary_color, font_style, brand_voice, brand_book")
      .eq("user_id", postRow.author_id)
      .maybeSingle();
    if (clientRow) {
      const hasManualColors = clientRow.primary_color != null || clientRow.secondary_color != null;
      const manualBrand = hasManualColors
        ? { primaryColor: clientRow.primary_color ?? "#7c5cfc", secondaryColor: clientRow.secondary_color ?? "#22d3a0", fontStyle: clientRow.font_style ?? "modern", brandVoice: clientRow.brand_voice ?? "professional" }
        : null;
      const rawBook = clientRow.brand_book as { visualIdentity?: { aestheticStyle?: string; imageStyle?: string; colorPalette?: string } } | null | undefined;
      const visualIdentity = rawBook?.visualIdentity;
      const brandStyleParts: string[] = [];
      if (manualBrand) {
        brandStyleParts.push(`Use EXACTLY these brand colours: primary ${manualBrand.primaryColor}, secondary ${manualBrand.secondaryColor} (for background and accents). Typography/font style: ${manualBrand.fontStyle}. Brand voice/mood: ${manualBrand.brandVoice}.`);
      } else if (visualIdentity) {
        if (visualIdentity.colorPalette) brandStyleParts.push(`Use EXACTLY this colour palette: ${visualIdentity.colorPalette}.`);
        if (visualIdentity.aestheticStyle) brandStyleParts.push(`Aesthetic/typography: ${visualIdentity.aestheticStyle}.`);
        if (visualIdentity.imageStyle) brandStyleParts.push(visualIdentity.imageStyle);
      }
      if (brandStyleParts.length > 0) brandStyle = brandStyleParts.join(" ") + " ";
    }
  }

  // ── Imagen via Gemini API: graphic illustration (not photography) ───────────
  try {
    const imagePrompt =
      `Editorial blog hero graphic (like Flow Productions blog) about: "${query}". ` +
      `BALANCED composition: solid or gradient background, 2–4 intentional elements — e.g. overlapping circles or soft shapes plus one symbolic/focal element (silhouette, hands, abstract motif). Clear focal point; not too empty, not too busy. Wide banner 16:9. ` +
      brandStyle +
      `Cohesive palette, flat or subtle depth, clean edges. High clarity so it scales well. ` +
      `Include a short headline in English on the image (2–4 words). The headline must be the TOP LAYER — no circles, shapes, or icons overlapping or covering the text; place all graphic elements behind the text or outside the headline area so the text is fully legible. Bold editorial typography. No logos or brand names; the headline is the only text.`;

    const response = await genai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: imagePrompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let foundImage = false;
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBuffer = Buffer.from(part.inlineData.data, "base64");
        contentType = "image/jpeg";
        source = "gemini";
        foundImage = true;
        break;
      }
    }
    if (!foundImage) throw new Error("No image returned from Gemini");

  } catch (imgErr) {
    // ── Picsum fallback ────────────────────────────────────────────────────
    console.warn("[cover] Imagen failed, falling back to Picsum:", imgErr);
    const seed = query.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const fallbackUrl = `https://picsum.photos/seed/${seed}/1920/1440`;
    const imgRes = await fetch(fallbackUrl, { redirect: "follow" });
    if (!imgRes.ok) return NextResponse.json({ error: "Failed to download fallback image" }, { status: 502 });
    imageBuffer = await imgRes.arrayBuffer();
    contentType = "image/jpeg";
    source = "picsum";
  }

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `${post_id}/cover-${Date.now()}.${ext}`;

  const { error: uploadError } = await admin.storage
    .from("covers")
    .upload(path, imageBuffer, { contentType, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("posts")
    .update({ cover_image_path: path })
    .eq("id", post_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage.from("covers").getPublicUrl(path);

  return NextResponse.json({
    success: true,
    path,
    publicUrl: urlData.publicUrl,
    source,
  });
}
