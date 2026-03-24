import crypto from "crypto";

export type WebhookEvent =
  | "post.published"
  | "post.updated"
  | "post.unpublished"
  | "post.deleted"
  | "cms.post.published"
  | "cms.post.updated";

/** Resolve event string from client format. Legacy = cms.post.* (original scheduler); spec = post.* */
export function resolveWebhookEvent(
  format: "spec" | "legacy" | null | undefined,
  isUpdate: boolean
): WebhookEvent {
  if (format === "legacy") {
    return isUpdate ? "cms.post.updated" : "cms.post.published";
  }
  return isUpdate ? "post.updated" : "post.published";
}

export interface RevalidationPostPayload {
  id: string;
  slug: string;
  status: string;
  updatedAt: string;
}

/**
 * Build spec-compliant revalidation payload (event, siteId, post minimal, timestamp, signatureVersion).
 * Can be merged with full post data for a single request.
 */
export function buildRevalidationPayload(
  event: WebhookEvent,
  siteId: string,
  post: RevalidationPostPayload
): { event: WebhookEvent; siteId: string; post: RevalidationPostPayload; timestamp: string; signatureVersion: string } {
  return {
    event,
    siteId,
    post: {
      id: post.id,
      slug: post.slug,
      status: post.status,
      updatedAt: post.updatedAt,
    },
    timestamp: new Date().toISOString(),
    signatureVersion: "v1",
  };
}

/**
 * Sign payload with HMAC-SHA256 using webhook secret.
 * Returns signature as hex string (x-cms-signature).
 */
export function signPayload(payload: object, secret: string): string {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Build headers for spec-compliant webhook delivery.
 * x-cms-signature, x-cms-timestamp, x-cms-event.
 */
export function buildWebhookHeaders(
  payload: object,
  secret: string,
  event: WebhookEvent
): Record<string, string> {
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const timestamp = new Date().toISOString();

  return {
    "Content-Type": "application/json",
    "x-cms-signature": signature,
    "x-cms-timestamp": timestamp,
    "x-cms-event": event,
  };
}
