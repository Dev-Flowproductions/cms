import { getPublicAppBaseUrl } from "@/lib/public-app-url";

/**
 * Base public URL for Google OAuth (no trailing slash).
 * See {@link getPublicAppBaseUrl} for scheme / host normalization.
 */
export function getOAuthAppBaseUrl(): string {
  return getPublicAppBaseUrl();
}

export function getGoogleOAuthRedirectUri(): string {
  const base = getOAuthAppBaseUrl();
  return base ? `${base}/api/google/callback` : "";
}
