import type { BridgeConfig } from "../config.js";
import { deletePostFromFramer } from "../framer/remove.js";
import { upsertPostToFramer } from "../framer/upsert.js";
import { headerValue, verifyWebhookAuth } from "./auth.js";
import {
  DELETE_EVENTS,
  UPSERT_EVENTS,
  type WebhookEnvelope,
  type WebhookPost,
} from "./types.js";

export interface HandlerResult {
  status: number;
  body: Record<string, unknown>;
}

export async function handleWebhookRequest(
  config: BridgeConfig,
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): Promise<HandlerResult> {
  const secretHeader = headerValue(headers, "x-webhook-secret");
  const signature = headerValue(headers, "x-cms-signature");

  if (!verifyWebhookAuth(rawBody, secretHeader, signature, config.webhookSecret)) {
    return { status: 401, body: { ok: false, error: "Unauthorized" } };
  }

  let payload: WebhookEnvelope;
  try {
    payload = JSON.parse(rawBody) as WebhookEnvelope;
  } catch {
    return { status: 400, body: { ok: false, error: "Invalid JSON body" } };
  }

  const event = typeof payload.event === "string" ? payload.event : "";
  const post = payload.post;

  if (!post || typeof post !== "object" || !isNonEmptyString(post.id)) {
    return { status: 400, body: { ok: false, error: "post.id is required" } };
  }

  if (DELETE_EVENTS.has(event)) {
    try {
      const result = await deletePostFromFramer(config, post.id, event || "post.deleted");
      return { status: 200, body: { ok: true, ...result } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      return { status: 500, body: { ok: false, error: message } };
    }
  }

  if (!UPSERT_EVENTS.has(event)) {
    return {
      status: 400,
      body: { ok: false, error: `Unsupported event: ${event || "(empty)"}` },
    };
  }

  if (!isNonEmptyString(post.slug) && !hasAnyTitle(post)) {
    return {
      status: 400,
      body: { ok: false, error: "post.slug or title is required for upsert" },
    };
  }

  try {
    const result = await upsertPostToFramer(config, post);
    return { status: 200, body: { ok: true, ...result } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upsert failed";
    return { status: 500, body: { ok: false, error: message } };
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function hasAnyTitle(post: WebhookPost): boolean {
  if (isNonEmptyString(post.title)) return true;
  const translations = post.translations ?? {};
  return Object.values(translations).some(
    (block) => block && isNonEmptyString(block.title)
  );
}
