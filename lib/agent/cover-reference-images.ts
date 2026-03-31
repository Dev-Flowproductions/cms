import type { SupabaseClient } from "@supabase/supabase-js";
import { MAX_BRAND_UPLOAD_BYTES } from "@/lib/brand/brand-asset-limits";
import type { CoverReferenceImagePart } from "./gemini-cover-image";

export type { CoverReferenceImagePart };

const BUCKET = "brand-assets";

function guessMimeFromPath(path: string): string {
  const p = path.toLowerCase();
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".webp")) return "image/webp";
  if (p.endsWith(".gif")) return "image/gif";
  if (p.endsWith(".heic") || p.endsWith(".heif")) return "image/heic";
  if (p.endsWith(".avif")) return "image/avif";
  if (p.endsWith(".bmp")) return "image/bmp";
  if (p.endsWith(".tif") || p.endsWith(".tiff")) return "image/tiff";
  return "image/jpeg";
}

/**
 * Download up to three client reference images from Supabase Storage for Gemini multimodal cover generation.
 */
export async function loadCoverReferenceImageParts(
  admin: SupabaseClient,
  paths: Array<string | null | undefined>,
): Promise<CoverReferenceImagePart[]> {
  const out: CoverReferenceImagePart[] = [];
  const unique = [...new Set(paths.filter((p): p is string => typeof p === "string" && p.trim().length > 0))];

  for (const path of unique.slice(0, 6)) {
    const { data, error } = await admin.storage.from(BUCKET).download(path.trim());
    if (error || !data) {
      console.warn("[cover-ref] Failed to download", path, error?.message);
      continue;
    }
    const buf = Buffer.from(await data.arrayBuffer());
    if (buf.length > MAX_BRAND_UPLOAD_BYTES) {
      console.warn("[cover-ref] Skipping oversized image", path);
      continue;
    }
    out.push({
      mimeType: guessMimeFromPath(path),
      base64: buf.toString("base64"),
    });
    if (out.length >= 3) break;
  }

  return out;
}
