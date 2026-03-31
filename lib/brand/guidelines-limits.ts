/**
 * Brand guidelines uploads (PDF / Markdown / TXT).
 * Must stay below `experimental.middlewareClientMaxBodySize` in next.config.ts
 * after multipart encoding overhead.
 */
export const MAX_GUIDELINES_FILE_BYTES = 40 * 1024 * 1024;

export const MAX_GUIDELINES_FILE_MB = 40;
