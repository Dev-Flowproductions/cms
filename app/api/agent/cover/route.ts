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
  let imageBuffer: ArrayBuffer;
  let contentType = "image/png";
  let source: string;

  // ── Imagen via Gemini API ──────────────────────────────────────────────────
  try {
    const imagePrompt =
      `Professional hero cover image for a blog post about: "${query}". ` +
      `Wide landscape, 16:9 aspect ratio. Keep the main subject centred — avoid placing key elements near the top or bottom edges, as the image will be cropped to 1200×630 for display. ` +
      `High quality, modern, editorial photography style. Clean composition. No text, no overlays, no watermarks, no borders.`;

    const response = await genai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9",
        outputMimeType: "image/jpeg",
      },
    });

    const img = response.generatedImages?.[0]?.image;
    if (!img?.imageBytes) throw new Error("No image bytes returned");

    const binaryStr = atob(img.imageBytes as unknown as string);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    imageBuffer = bytes.buffer;
    contentType = "image/jpeg";
    source = "imagen";

  } catch (imgErr) {
    // ── Picsum fallback ────────────────────────────────────────────────────
    console.warn("[cover] Imagen failed, falling back to Picsum:", imgErr);
    const seed = query.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const fallbackUrl = `https://picsum.photos/seed/${seed}/1200/630`;
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
