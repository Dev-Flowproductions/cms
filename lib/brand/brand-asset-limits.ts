/**
 * Large brand-asset uploads (guidelines PDFs, cover reference images).
 * Must stay below `experimental.middlewareClientMaxBodySize` in next.config.ts
 * after multipart boundaries and encoding overhead.
 * (Supabase Storage also has a per-object limit — raise it in the dashboard if uploads fail server-side.)
 */
export const MAX_BRAND_UPLOAD_MB = 500;
export const MAX_BRAND_UPLOAD_BYTES = MAX_BRAND_UPLOAD_MB * 1024 * 1024;

/** Logos, profile avatars, blog author avatars — small files for fast loads. */
export const MAX_SMALL_IMAGE_MB = 4;
export const MAX_SMALL_IMAGE_BYTES = MAX_SMALL_IMAGE_MB * 1024 * 1024;
