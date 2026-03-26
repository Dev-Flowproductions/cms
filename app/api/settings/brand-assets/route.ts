import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractBrandGuidelinesText } from "@/lib/agent/extract-guidelines-text";

const BUCKET = "brand-assets";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_GUIDE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("action")?.toString();

  const admin = createAdminClient();

  const { data: clientRow, error: clientErr } = await admin
    .from("clients")
    .select(
      "id, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_storage_path",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientErr || !clientRow) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  async function removeStoragePath(path: string | null | undefined) {
    if (!path?.trim()) return;
    await admin.storage.from(BUCKET).remove([path.trim()]);
  }

  if (action === "removeCoverRef") {
    const slot = Number(formData.get("slot"));
    if (slot !== 1 && slot !== 2 && slot !== 3) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }
    const prev =
      slot === 1
        ? clientRow.cover_reference_image_1
        : slot === 2
          ? clientRow.cover_reference_image_2
          : clientRow.cover_reference_image_3;
    await removeStoragePath(prev);
    const patch =
      slot === 1
        ? { cover_reference_image_1: null }
        : slot === 2
          ? { cover_reference_image_2: null }
          : { cover_reference_image_3: null };
    const { error } = await supabase.from("clients").update(patch).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "removeGuidelines") {
    await removeStoragePath(clientRow.brand_guidelines_storage_path);
    const { error } = await supabase
      .from("clients")
      .update({ brand_guidelines_storage_path: null, brand_guidelines_text: null })
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "coverRef") {
    const slot = Number(formData.get("slot"));
    if (slot !== 1 && slot !== 2 && slot !== 3) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }
    const file = formData.get("file") as File | null;
    if (!file?.size) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Images only (JPEG, PNG, WebP)" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image too large (max 4MB)" }, { status: 400 });
    }

    const prev =
      slot === 1
        ? clientRow.cover_reference_image_1
        : slot === 2
          ? clientRow.cover_reference_image_2
          : clientRow.cover_reference_image_3;
    await removeStoragePath(prev);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${user.id}/cover-ref-${slot}-${Date.now()}.${safeExt}`;

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const patch =
      slot === 1
        ? { cover_reference_image_1: path }
        : slot === 2
          ? { cover_reference_image_2: path }
          : { cover_reference_image_3: path };
    const { error } = await supabase.from("clients").update(patch).eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, path });
  }

  if (action === "guidelines") {
    const file = formData.get("file") as File | null;
    if (!file?.size) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (file.size > MAX_GUIDE_BYTES) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }

    const mime = file.type || "application/octet-stream";
    const lower = file.name.toLowerCase();
    const ok =
      mime.includes("pdf") ||
      mime.includes("text/plain") ||
      mime.includes("markdown") ||
      lower.endsWith(".md") ||
      lower.endsWith(".txt") ||
      lower.endsWith(".pdf");
    if (!ok) {
      return NextResponse.json({ error: "Use PDF, TXT, or Markdown" }, { status: 400 });
    }

    await removeStoragePath(clientRow.brand_guidelines_storage_path);

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = lower.endsWith(".pdf") ? "pdf" : lower.endsWith(".md") ? "md" : "txt";
    const path = `${user.id}/guidelines-${Date.now()}.${ext}`;

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, buf, {
      cacheControl: "3600",
      upsert: true,
      contentType: mime,
    });
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    let extracted = "";
    try {
      extracted = await extractBrandGuidelinesText(buf, mime, file.name);
    } catch (e) {
      console.warn("[brand-assets] Guidelines extract failed:", e);
      extracted = "";
    }

    const { error } = await supabase
      .from("clients")
      .update({
        brand_guidelines_storage_path: path,
        brand_guidelines_text: extracted.trim() || null,
      })
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, path, extractedLength: extracted.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
