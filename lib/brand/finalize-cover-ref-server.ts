import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_BRAND_UPLOAD_BYTES, MAX_BRAND_UPLOAD_MB } from "@/lib/brand/brand-asset-limits";
import {
  coverRefUploadContentType,
  normalizeCoverRefFileExt,
  parseCoverRefStoragePath,
} from "@/lib/brand/cover-ref-upload";
import { isLikelyImageBlob } from "@/lib/http/form-data";

const BUCKET = "brand-assets";

type CoverRefPatch = {
  cover_reference_image_1?: string;
  cover_reference_image_2?: string;
  cover_reference_image_3?: string;
};

/**
 * After a direct-to-Storage upload, verify the object and persist the path on `clients`.
 */
export async function validateAndPersistCoverRef(opts: {
  admin: SupabaseClient;
  persist: (patch: CoverRefPatch) => Promise<{ error: { message: string } | null }>;
  ownerUserId: string;
  path: string;
  slot: 1 | 2 | 3;
}): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { admin, persist, ownerUserId, path, slot } = opts;
  const parsed = parseCoverRefStoragePath(path, ownerUserId);
  if (!parsed || parsed.slot !== slot) {
    return { ok: false, status: 400, error: "Invalid path or slot" };
  }

  const { data: fileBlob, error: dlErr } = await admin.storage.from(BUCKET).download(path);
  if (dlErr || !fileBlob) {
    return {
      ok: false,
      status: 400,
      error: dlErr?.message ?? "Could not read uploaded file from storage",
    };
  }

  const buf = Buffer.from(await fileBlob.arrayBuffer());
  if (buf.length === 0) {
    await admin.storage.from(BUCKET).remove([path]);
    return { ok: false, status: 400, error: "Empty file" };
  }
  if (buf.length > MAX_BRAND_UPLOAD_BYTES) {
    await admin.storage.from(BUCKET).remove([path]);
    return {
      ok: false,
      status: 400,
      error: `Image too large (max ${MAX_BRAND_UPLOAD_MB}MB)`,
    };
  }

  const ext = path.includes(".") ? path.slice(path.lastIndexOf(".") + 1) : "jpg";
  const safeExt = normalizeCoverRefFileExt(ext);
  const mime = coverRefUploadContentType(safeExt, typeof fileBlob.type === "string" ? fileBlob.type : "");
  const synth = new File([buf], `ref.${safeExt}`, { type: mime });
  if (!isLikelyImageBlob(synth)) {
    await admin.storage.from(BUCKET).remove([path]);
    return { ok: false, status: 400, error: "Images only (JPEG, PNG, WebP, …)" };
  }

  const { data: clientRow, error: clientErr } = await admin
    .from("clients")
    .select("cover_reference_image_1, cover_reference_image_2, cover_reference_image_3")
    .eq("user_id", ownerUserId)
    .maybeSingle();

  if (clientErr || !clientRow) {
    await admin.storage.from(BUCKET).remove([path]);
    return { ok: false, status: 404, error: "Client not found" };
  }

  const prev =
    slot === 1
      ? clientRow.cover_reference_image_1
      : slot === 2
        ? clientRow.cover_reference_image_2
        : clientRow.cover_reference_image_3;
  const prevTrim = prev?.trim() ?? "";
  if (prevTrim && prevTrim !== path) {
    await admin.storage.from(BUCKET).remove([prevTrim]);
  }

  const patch: CoverRefPatch =
    slot === 1
      ? { cover_reference_image_1: path }
      : slot === 2
        ? { cover_reference_image_2: path }
        : { cover_reference_image_3: path };

  const { error } = await persist(patch);
  if (error) {
    await admin.storage.from(BUCKET).remove([path]);
    return { ok: false, status: 500, error: error.message };
  }

  return { ok: true };
}
