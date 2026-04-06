/**
 * Normalized public origin from NEXT_PUBLIC_APP_URL (no trailing slash).
 * Host-only values (e.g. cms.witflow.co) get https:// so OAuth and fetch() work.
 */
export function getPublicAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return "";
  const noTrailingSlash = raw.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(noTrailingSlash)) {
    return noTrailingSlash;
  }
  const host = noTrailingSlash.replace(/^\/+/, "");
  if (!host) return "";
  const isLocal =
    /^localhost\b/i.test(host) ||
    /^127\.\d+\.\d+\.\d+/.test(host) ||
    /^\[::1\]/.test(host);
  return `${isLocal ? "http" : "https"}://${host}`;
}

/** When the env is unset (typical local dev), use localhost. */
export function getPublicAppBaseUrlOrLocalhost(): string {
  return getPublicAppBaseUrl() || "http://localhost:3000";
}
