/**
 * Large brand-asset uploads (guidelines PDFs, cover reference images).
 * Must stay below `experimental.middlewareClientMaxBodySize` in next.config.ts
 * after multipart boundaries and encoding overhead.
 */
export const MAX_BRAND_UPLOAD_MB = 120;
export const MAX_BRAND_UPLOAD_BYTES = MAX_BRAND_UPLOAD_MB * 1024 * 1024;

/** Logos, profile avatars, blog author avatars — small files for fast loads. */
export const MAX_SMALL_IMAGE_MB = 4;
export const MAX_SMALL_IMAGE_BYTES = MAX_SMALL_IMAGE_MB * 1024 * 1024;
