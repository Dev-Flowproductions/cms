import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoverReferenceImagePart } from "./gemini-cover-image";

export type { CoverReferenceImagePart };

const BUCKET = "brand-assets";

function guessMimeFromPath(path: string): string {
  const p = path.toLowerCase();
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".webp")) return "image/webp";
  if (p.endsWith(".gif")) return "image/gif";
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
    if (buf.length > 4 * 1024 * 1024) {
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
