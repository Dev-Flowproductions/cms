export type ResolvedGuidelinesFile = {
  ok: true;
  ext: "pdf" | "md" | "txt";
  contentType: string;
};

export type RejectedGuidelinesFile = {
  ok: false;
  error: string;
};

/** Scan leading bytes for %PDF (handles BOM, long comments, some exports that delay the header). */
export function bufferContainsPdfHeader(buf: Buffer, maxScan = 65536): boolean {
  const limit = Math.min(buf.length, maxScan);
  for (let i = 0; i <= limit - 4; i++) {
    if (
      buf[i] === 0x25 &&
      buf[i + 1] === 0x50 &&
      buf[i + 2] === 0x44 &&
      buf[i + 3] === 0x46
    ) {
      return true;
    }
  }
  return false;
}

function looksLikePlainTextBuffer(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 16_384));
  if (sample.length === 0) return false;
  if (sample.includes(0)) return false;
  let badControl = 0;
  for (let i = 0; i < sample.length; i++) {
    const c = sample[i]!;
    if (c < 32 && c !== 9 && c !== 10 && c !== 13) badControl++;
  }
  return badControl / sample.length < 0.02;
}

/**
 * Accept brand-guidelines uploads when the browser omits MIME types or strips extensions (common with PDFs).
 */
export function resolveGuidelinesBuffer(
  fileName: string,
  declaredMime: string,
  buf: Buffer,
): ResolvedGuidelinesFile | RejectedGuidelinesFile {
  const lower = fileName.toLowerCase();
  const mime = (declaredMime || "").toLowerCase().trim();

  const pdfByName = /\.pdf$/i.test(fileName.trim());
  const pdfByMime =
    mime.includes("pdf") || mime === "application/acrobat" || mime.endsWith("+pdf");

  if (pdfByName || pdfByMime || bufferContainsPdfHeader(buf)) {
    return { ok: true, ext: "pdf", contentType: "application/pdf" };
  }

  if (
    lower.endsWith(".md") ||
    lower.endsWith(".markdown") ||
    mime.includes("markdown") ||
    mime === "text/md" ||
    mime === "text/x-markdown"
  ) {
    return {
      ok: true,
      ext: "md",
      contentType:
        declaredMime &&
        (declaredMime.toLowerCase().includes("markdown") || declaredMime.startsWith("text/"))
          ? declaredMime
          : "text/markdown",
    };
  }

  if (
    lower.endsWith(".txt") ||
    lower.endsWith(".text") ||
    mime.includes("text/plain") ||
    mime === "text/txt"
  ) {
    return {
      ok: true,
      ext: "txt",
      contentType:
        declaredMime && declaredMime.toLowerCase().includes("text/plain")
          ? declaredMime
          : "text/plain; charset=utf-8",
    };
  }

  if ((mime === "" || mime === "application/octet-stream") && looksLikePlainTextBuffer(buf)) {
    return { ok: true, ext: "txt", contentType: "text/plain; charset=utf-8" };
  }

  return { ok: false, error: "Use PDF, TXT, or Markdown" };
}

export function resolveGuidelinesFile(
  file: File,
  buf: Buffer,
): ResolvedGuidelinesFile | RejectedGuidelinesFile {
  return resolveGuidelinesBuffer(file.name, file.type, buf);
}

/** Normalize FormData action keys (case / stray spaces / zero-width chars). */
export function normalizeAdminAssetAction(raw: string | undefined | null): string {
  return (raw ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}
