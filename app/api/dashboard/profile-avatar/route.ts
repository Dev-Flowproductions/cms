import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getMultipartBlob,
  getMultipartSmallTextField,
  isLikelyImageBlob,
} from "@/lib/http/form-data";

const LOGOS_BUCKET = "logos";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function logosPathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const marker = `/storage/v1/object/public/${LOGOS_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  try {
    return decodeURIComponent(url.slice(i + marker.length).split("?")[0] ?? "");
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const replaceAvatarUrl =
    (await getMultipartSmallTextField(formData, "replaceAvatarUrl", 2048)).trim() || null;

  const prevPath = logosPathFromPublicUrl(replaceAvatarUrl);
  if (prevPath?.startsWith(`${user.id}/`)) {
    await supabase.storage.from(LOGOS_BUCKET).remove([prevPath]);
  }

  const file = getMultipartBlob(formData, "file");
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!isLikelyImageBlob(file)) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image too large (max 4 MB)" }, { status: 400 });
  }

  const fileName = file instanceof File ? file.name : "avatar.png";
  const ext = fileName.split(".").pop()?.toLowerCase() || "png";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "png";
  const path = `${user.id}/profile-avatar-${Date.now()}.${safeExt}`;

  const uploadMime =
    file.type && file.type.startsWith("image/")
      ? file.type
      : safeExt === "png"
        ? "image/png"
        : safeExt === "webp"
          ? "image/webp"
          : safeExt === "gif"
            ? "image/gif"
            : "image/jpeg";

  const { error: upErr } = await supabase.storage
    .from(LOGOS_BUCKET)
    .upload(path, file as File, { cacheControl: "3600", upsert: true, contentType: uploadMime });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path);
  return NextResponse.json({ success: true, avatarUrl: publicUrlData.publicUrl });
}
