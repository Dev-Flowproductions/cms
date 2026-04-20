import { createAdminClient } from "@/lib/supabase/admin";
import { inngest } from "@/lib/inngest/client";

/**
 * If this post originated from a DG brief, enqueue a CMS → DG status webhook
 * (retries + backoff handled by the Inngest function `deliverDgStatusWebhook`).
 */
export async function notifyDgArticleStatusIfLinked(postId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: rec } = await admin
    .from("dg_integration_records")
    .select("id")
    .eq("post_id", postId)
    .maybeSingle();

  if (!rec?.id) return;

  const eventId = crypto.randomUUID();

  try {
    await inngest.send({
      name: "cms/dg.status-webhook.deliver",
      data: { integrationRecordId: rec.id, eventId },
    });
  } catch (err) {
    console.error("[dg] Failed to enqueue status webhook:", err);
    await admin
      .from("dg_integration_records")
      .update({
        last_webhook_error:
          err instanceof Error ? err.message : "Failed to enqueue DG status webhook",
      })
      .eq("id", rec.id);
  }
}
