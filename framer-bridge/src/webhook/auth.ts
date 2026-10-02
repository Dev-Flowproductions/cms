import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Parity with wordpress-plugin Witflow_CMS_Auth:
 * accept x-webhook-secret OR x-cms-signature = HMAC-SHA256(rawBody, secret) hex.
 */
export function verifyWebhookAuth(
  rawBody: string,
  headerSecret: string | null,
  signature: string | null,
  secret: string
): boolean {
  if (!secret.trim()) return false;

  if (headerSecret && stringsEqual(secret, headerSecret)) {
    return true;
  }

  if (signature) {
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    return stringsEqual(expected, signature);
  }

  return false;
}

function stringsEqual(known: string, user: string): boolean {
  const a = Buffer.from(known);
  const b = Buffer.from(user);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | null {
  const key = Object.keys(headers).find((h) => h.toLowerCase() === name.toLowerCase());
  if (!key) return null;
  const value = headers[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
