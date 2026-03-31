import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser, getUserRoles, hasAdminRole } from "@/lib/auth";
import { generateClientSpecificInstructions } from "@/lib/agent/generate-client-instructions";
import { extractBrandGuidelinesText } from "@/lib/agent/extract-guidelines-text";
import { normalizeAdminAssetAction, resolveGuidelinesBuffer } from "@/lib/agent/guidelines-upload";
import { getMultipartBlob, getMultipartSmallTextField } from "@/lib/http/form-data";
import {
  MAX_BRAND_UPLOAD_BYTES,
  MAX_BRAND_UPLOAD_MB,
  MAX_SMALL_IMAGE_BYTES,
  MAX_SMALL_IMAGE_MB,
} from "@/lib/brand/brand-asset-limits";

const BRAND_BUCKET = "brand-assets";
const LOGOS_BUCKET = "logos";

function isLikelyImageFile(blob: Blob): boolean {
  if (blob.type.startsWith("image/")) return true;
  const n = blob instanceof File ? blob.name.toLowerCase() : "";
  return /\.(jpe?g|png|webp|gif)$/i.test(n);
}

function isValidTargetUserId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

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

async function syncCustomInstructions(admin: ReturnType<typeof createAdminClient>, targetUserId: string) {
  const { data: client, error: fetchError } = await admin
    .from("clients")
    .select(
      "domain, company_name, brand_name, brand_tone, brand_book, primary_color, secondary_color, tertiary_color, alternative_color, font_style, brand_voice, logo_url",
    )
    .eq("user_id", targetUserId)
    .maybeSingle();
  if (fetchError || !client) return;
  const customInstructions = generateClientSpecificInstructions(client);
  await admin
    .from("clients")
    .update({
      custom_instructions: customInstructions.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", targetUserId);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId: targetUserId } = await context.params;
  const targetId = targetUserId?.trim() ?? "";
  if (!targetId || !isValidTargetUserId(targetId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const roles = await getUserRoles(sessionUser.id);
  if (!hasAdminRole(roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: clientRow, error: clientErr } = await admin
    .from("clients")
    .select(
      "id, user_id, logo_url, cover_reference_image_1, cover_reference_image_2, cover_reference_image_3, brand_guidelines_storage_path",
    )
    .eq("user_id", targetId)
    .maybeSingle();

  if (clientErr || !clientRow) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { data: profileRow } = await admin
    .from("profiles")
    .select("avatar_url")
    .eq("id", targetId)
    .maybeSingle();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error: `Could not read upload (body too large or broken). Max ${MAX_BRAND_UPLOAD_MB}MB per file; try a smaller file or compress.`,
      },
      { status: 413 },
    );
  }
  const actionKey = normalizeAdminAssetAction(await getMultipartSmallTextField(formData, "action"));

  async function removeStoragePath(bucket: string, path: string | null | undefined) {
    if (!path?.trim()) return;
    await admin.storage.from(bucket).remove([path.trim()]);
  }

  if (actionKey === "removelogo") {
    const prevPath = logosPathFromPublicUrl(clientRow.logo_url);
    await removeStoragePath(LOGOS_BUCKET, prevPath);
    const { error } = await admin
      .from("clients")
      .update({ logo_url: null, updated_at: new Date().toISOString() })
      .eq("user_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await syncCustomInstructions(admin, targetId);
    return NextResponse.json({ success: true });
  }

  if (actionKey === "removeavatar") {
    const prevPath = logosPathFromPublicUrl(profileRow?.avatar_url);
    await removeStoragePath(LOGOS_BUCKET, prevPath);
    const { error } = await admin.from("profiles").update({ avatar_url: null }).eq("id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (actionKey === "logo") {
    const file = getMultipartBlob(formData, "file");
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!isLikelyImageFile(file)) {
      return NextResponse.json({ error: "Images only" }, { status: 400 });
    }
    if (file.size > MAX_SMALL_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image too large (max ${MAX_SMALL_IMAGE_MB}MB)` },
        { status: 400 },
      );
    }

    const prevPath = logosPathFromPublicUrl(clientRow.logo_url);
    await removeStoragePath(LOGOS_BUCKET, prevPath);

    const fileName = file instanceof File ? file.name : "logo.png";
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "png";
    const path = `${targetId}/logo-${Date.now()}.${safeExt}`;
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

    const { error: upErr } = await admin.storage.from(LOGOS_BUCKET).upload(path, file as File, {
      cacheControl: "3600",
      upsert: true,
      contentType: uploadMime,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: publicUrl } = admin.storage.from(LOGOS_BUCKET).getPublicUrl(path);
    const logoUrl = publicUrl.publicUrl;

    const { error } = await admin
      .from("clients")
      .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq("user_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await syncCustomInstructions(admin, targetId);
    return NextResponse.json({ success: true, logoUrl });
  }

  if (actionKey === "avatar") {
    const file = getMultipartBlob(formData, "file");
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!isLikelyImageFile(file)) {
      return NextResponse.json({ error: "Images only" }, { status: 400 });
    }
    if (file.size > MAX_SMALL_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image too large (max ${MAX_SMALL_IMAGE_MB}MB)` },
        { status: 400 },
      );
    }

    const prevPath = logosPathFromPublicUrl(profileRow?.avatar_url);
    await removeStoragePath(LOGOS_BUCKET, prevPath);

    const fileName = file instanceof File ? file.name : "avatar.png";
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "png";
    const path = `${targetId}/avatar-${Date.now()}.${safeExt}`;
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

    const { error: upErr } = await admin.storage.from(LOGOS_BUCKET).upload(path, file as File, {
      cacheControl: "3600",
      upsert: true,
      contentType: uploadMime,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: publicUrl } = admin.storage.from(LOGOS_BUCKET).getPublicUrl(path);
    const avatarUrl = publicUrl.publicUrl;

    const { error } = await admin.from("profiles").update({ avatar_url: avatarUrl }).eq("id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, avatarUrl });
  }

  if (actionKey === "blogauthoravatar") {
    const blogAuthorIdRaw = (await getMultipartSmallTextField(formData, "blogAuthorId", 64)).trim();
    const blogAuthorId = blogAuthorIdRaw || "new";
    const replaceAvatarUrl = (await getMultipartSmallTextField(formData, "replaceAvatarUrl", 2048)).trim() || null;

    const uuidOk = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(blogAuthorId);
    if (blogAuthorId !== "new" && !uuidOk) {
      return NextResponse.json({ error: "Invalid author id" }, { status: 400 });
    }

    let prevUrl: string | null = replaceAvatarUrl;
    if (blogAuthorId !== "new") {
      const { data: ba, error: baErr } = await admin
        .from("blog_authors")
        .select("avatar_url")
        .eq("id", blogAuthorId)
        .eq("user_id", targetId)
        .maybeSingle();
      if (baErr || !ba) {
        return NextResponse.json({ error: "Blog author not found" }, { status: 404 });
      }
      if (!prevUrl) prevUrl = ba.avatar_url;
    }

    const prevPath = logosPathFromPublicUrl(prevUrl);
    if (prevPath?.startsWith(`${targetId}/`)) {
      await removeStoragePath(LOGOS_BUCKET, prevPath);
    }

    const file = getMultipartBlob(formData, "file");
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!isLikelyImageFile(file)) {
      return NextResponse.json({ error: "Images only" }, { status: 400 });
    }
    if (file.size > MAX_SMALL_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image too large (max ${MAX_SMALL_IMAGE_MB}MB)` },
        { status: 400 },
      );
    }

    const fileName = file instanceof File ? file.name : "avatar.png";
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "png";
    const path =
      blogAuthorId === "new"
        ? `${targetId}/blog-author-new-${Date.now()}.${safeExt}`
        : `${targetId}/blog-author-${blogAuthorId}-${Date.now()}.${safeExt}`;
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

    const { error: upErr } = await admin.storage.from(LOGOS_BUCKET).upload(path, file as File, {
      cacheControl: "3600",
      upsert: true,
      contentType: uploadMime,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: publicUrl } = admin.storage.from(LOGOS_BUCKET).getPublicUrl(path);
    return NextResponse.json({ success: true, avatarUrl: publicUrl.publicUrl });
  }

  if (actionKey === "removecoverref") {
    const slot = Number(await getMultipartSmallTextField(formData, "slot", 8));
    if (slot !== 1 && slot !== 2 && slot !== 3) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }
    const prev =
      slot === 1
        ? clientRow.cover_reference_image_1
        : slot === 2
          ? clientRow.cover_reference_image_2
          : clientRow.cover_reference_image_3;
    await removeStoragePath(BRAND_BUCKET, prev);
    const patch =
      slot === 1
        ? { cover_reference_image_1: null }
        : slot === 2
          ? { cover_reference_image_2: null }
          : { cover_reference_image_3: null };
    const { error } = await admin.from("clients").update(patch).eq("user_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (actionKey === "removeguidelines") {
    await removeStoragePath(BRAND_BUCKET, clientRow.brand_guidelines_storage_path);
    const { error } = await admin
      .from("clients")
      .update({ brand_guidelines_storage_path: null, brand_guidelines_text: null })
      .eq("user_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (actionKey === "coverref") {
    const slot = Number(await getMultipartSmallTextField(formData, "slot", 8));
    if (slot !== 1 && slot !== 2 && slot !== 3) {
      return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    }
    const file = getMultipartBlob(formData, "file");
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!isLikelyImageFile(file)) {
      return NextResponse.json({ error: "Images only (JPEG, PNG, WebP)" }, { status: 400 });
    }
    if (file.size > MAX_BRAND_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Image too large (max ${MAX_BRAND_UPLOAD_MB}MB)` },
        { status: 400 },
      );
    }

    const prev =
      slot === 1
        ? clientRow.cover_reference_image_1
        : slot === 2
          ? clientRow.cover_reference_image_2
          : clientRow.cover_reference_image_3;
    await removeStoragePath(BRAND_BUCKET, prev);

    const fileName = file instanceof File ? file.name : "cover.jpg";
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${targetId}/cover-ref-${slot}-${Date.now()}.${safeExt}`;
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

    const { error: upErr } = await admin.storage.from(BRAND_BUCKET).upload(path, file as File, {
      cacheControl: "3600",
      upsert: true,
      contentType: uploadMime,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const patch =
      slot === 1
        ? { cover_reference_image_1: path }
        : slot === 2
          ? { cover_reference_image_2: path }
          : { cover_reference_image_3: path };
    const { error } = await admin.from("clients").update(patch).eq("user_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, path });
  }

  if (actionKey === "guidelines") {
    const blob = getMultipartBlob(formData, "file", "upload");
    if (!blob) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (blob.size > MAX_BRAND_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_BRAND_UPLOAD_MB}MB)` },
        { status: 400 },
      );
    }

    const buf = Buffer.from(await blob.arrayBuffer());
    const uploadName = blob instanceof File ? blob.name : "";
    const resolved = resolveGuidelinesBuffer(uploadName, blob.type, buf);
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    await removeStoragePath(BRAND_BUCKET, clientRow.brand_guidelines_storage_path);

    const path = `${targetId}/guidelines-${Date.now()}.${resolved.ext}`;
    const extractName =
      uploadName && /\.(pdf|md|markdown|txt|text)$/i.test(uploadName)
        ? uploadName
        : `guidelines.${resolved.ext}`;

    const { error: upErr } = await admin.storage.from(BRAND_BUCKET).upload(path, buf, {
      cacheControl: "3600",
      upsert: true,
      contentType: resolved.contentType,
    });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    let extracted = "";
    try {
      extracted = await extractBrandGuidelinesText(buf, resolved.contentType, extractName);
    } catch (e) {
      console.warn("[admin user assets] Guidelines extract failed:", e);
      extracted = "";
    }

    const { error } = await admin
      .from("clients")
      .update({
        brand_guidelines_storage_path: path,
        brand_guidelines_text: extracted.trim() || null,
      })
      .eq("user_id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, path, extractedLength: extracted.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
