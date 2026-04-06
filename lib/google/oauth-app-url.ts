/**
 * Base public URL for OAuth redirects (no trailing slash).
 * A trailing slash in NEXT_PUBLIC_APP_URL would produce redirect_uris like
 * `https://host//api/google/callback`, which Google rejects with `invalid_request`.
 */
export function getOAuthAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}

export function getGoogleOAuthRedirectUri(): string {
  const base = getOAuthAppBaseUrl();
  return base ? `${base}/api/google/callback` : "";
}
