/** Allowed storage extensions for cover reference images (aligned with brand-assets API). */
const COVER_REF_EXTS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "heic",
  "heif",
  "avif",
  "bmp",
  "tif",
  "tiff",
] as const;

export function normalizeCoverRefFileExt(raw: string): string {
  const e = raw.toLowerCase().replace(/^\./, "");
  return (COVER_REF_EXTS as readonly string[]).includes(e) ? e : "jpg";
}

export function buildCoverRefStoragePath(userId: string, slot: 1 | 2 | 3, ext: string, nowMs = Date.now()): string {
  const safe = normalizeCoverRefFileExt(ext);
  return `${userId}/cover-ref-${slot}-${nowMs}.${safe}`;
}

/** Validates `userId/cover-ref-{slot}-{timestamp}.{ext}` owned by `ownerUserId`. */
export function parseCoverRefStoragePath(path: string, ownerUserId: string): { slot: 1 | 2 | 3 } | null {
  if (!path?.trim() || path.includes("..") || path.includes("//")) return null;
  const parts = path.split("/");
  if (parts.length !== 2) return null;
  const [folder, file] = parts;
  if (!folder || !file) return null;
  if (folder.toLowerCase() !== ownerUserId.trim().toLowerCase()) return null;
  const m = /^cover-ref-([123])-(\d+)\.([a-z0-9]+)$/i.exec(file);
  if (!m) return null;
  return { slot: Number(m[1]) as 1 | 2 | 3 };
}

export function coverRefUploadContentType(safeExt: string, fileType: string): string {
  if (fileType?.trim() && fileType.startsWith("image/")) return fileType;
  switch (safeExt) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "heic":
    case "heif":
      return "image/heic";
    case "avif":
      return "image/avif";
    case "bmp":
      return "image/bmp";
    case "tif":
    case "tiff":
      return "image/tiff";
    default:
      return "image/jpeg";
  }
}
