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

  // ── Imagen via Gemini API ──────────────────────────────────────────────────
  try {
    const imagePrompt =
      `Editorial photography: a professional scene related to "${query}". ` +
      `4:3 aspect ratio, full-width hero image. ` +
      `High quality, cinematic lighting, sharp focus, photorealistic. ` +
      `IMPORTANT: pure photography only — absolutely NO text, NO letters, NO numbers, NO words, NO code, NO HTML, NO CSS, NO UI elements, NO screenshots, NO diagrams, NO overlays, NO watermarks, NO borders, NO captions. ` +
      `The entire frame must be a real-world photographic scene with no written characters of any kind.`;

    const response = await genai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: imagePrompt,
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
