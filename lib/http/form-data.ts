/**
 * Next/undici FormData: only string fields are typeof "string".
 * Using .toString() on a File yields "[object File]" and breaks action routing.
 * Some runtimes expose short text parts as File/Blob (empty filename) — use getMultipartSmallTextField.
 */
export function getMultipartString(formData: FormData, name: string): string {
  for (const v of formData.getAll(name)) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  for (const v of formData.getAll(name)) {
    if (typeof v === "string") return v;
  }
  return "";
}

/**
 * Read a short text field when it may arrive as a small Blob/File instead of a string.
 */
export async function getMultipartSmallTextField(
  formData: FormData,
  name: string,
  maxBytes = 256,
): Promise<string> {
  const direct = getMultipartString(formData, name).trim();
  if (direct.length > 0) return direct;
  for (const v of formData.getAll(name)) {
    if (v instanceof Blob && v.size > 0 && v.size <= maxBytes) {
      try {
        const t = (await v.text()).trim();
        if (t.length > 0) return t;
      } catch {
        /* ignore */
      }
    }
  }
  return "";
}

export function getMultipartBlob(formData: FormData, ...names: string[]): Blob | null {
  for (const n of names) {
    for (const v of formData.getAll(n)) {
      if (v instanceof Blob && v.size > 0) return v;
    }
  }
  return null;
}

/** True when MIME is image/* or the filename looks like a common raster image (handles empty browser MIME). */
export function isLikelyImageBlob(blob: Blob): boolean {
  if (blob.type.startsWith("image/")) return true;
  const n = blob instanceof File ? blob.name.toLowerCase() : "";
  return /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp|tiff?)$/i.test(n);
}
