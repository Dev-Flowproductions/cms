import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  dgCanonicalStatusLabel,
  mapPostStatusToDgCanonical,
} from "@/lib/integrations/dg/canonical-status";
import { buildDgArticleAdminUrl, buildDgPublishedPostUrl } from "@/lib/integrations/dg/urls";
import type { PostStatus } from "@/lib/types/db";

/** Backoff between attempts (contract example: 1m, 5m, 15m, 1h, 6h). */
const BACKOFF_DURATIONS = ["1m", "5m", "15m", "1h", "6h"] as const;

type DeliverEventData = {
  integrationRecordId: string;
  eventId: string;
};

/**
 * Sends CMS → DG article status webhook with up to 6 attempts and contract backoff.
 * Triggered by `cms/dg.status-webhook.deliver` (see `notifyDgArticleStatusIfLinked`).
 */
export const deliverDgStatusWebhook = inngest.createFunction(
  {
    id: "deliver-dg-status-webhook",
    name: "Deliver DG status webhook",
    retries: 0,
    triggers: [{ event: "cms/dg.status-webhook.deliver" }],
  },
  async ({ event, step }) => {
    const { integrationRecordId, eventId } = event.data as DeliverEventData;

    const url = process.env.DG_STATUS_WEBHOOK_URL?.trim();
    const bearer = process.env.DG_STATUS_WEBHOOK_BEARER_SECRET?.trim();
    if (!url || !bearer) {
      await step.run("mark-missing-env", async () => {
        const admin = createAdminClient();
        await admin
          .from("dg_integration_records")
          .update({
            last_webhook_error:
              "Missing DG_STATUS_WEBHOOK_URL or DG_STATUS_WEBHOOK_BEARER_SECRET",
          })
          .eq("id", integrationRecordId);
      });
      return { skipped: true as const };
    }

    let lastError = "All delivery attempts failed";

    for (let attempt = 0; attempt < 6; attempt++) {
      const result = await step.run(`deliver-attempt-${attempt}`, async () => {
        const admin = createAdminClient();
        const { data: record, error: recErr } = await admin
          .from("dg_integration_records")
          .select(
            "id, request_id, dg_project_id, dg_strategy_id, dg_campaign_id, cms_site_id, post_id",
          )
          .eq("id", integrationRecordId)
          .maybeSingle();

        if (recErr || !record?.post_id) {
          return { ok: false as const, error: recErr?.message ?? "Record or post missing" };
        }

        const { data: post, error: postErr } = await admin
          .from("posts")
          .select("id, status, slug, primary_locale")
          .eq("id", record.post_id)
          .maybeSingle();

        if (postErr || !post) {
          return { ok: false as const, error: postErr?.message ?? "Post not found" };
        }

        const { data: client, error: clientErr } = await admin
          .from("clients")
          .select("id, domain, blog_base_path")
          .eq("id", record.cms_site_id)
          .maybeSingle();

        if (clientErr || !client) {
          return { ok: false as const, error: clientErr?.message ?? "Client (site) not found" };
        }

        const canonical = mapPostStatusToDgCanonical(post.status as PostStatus);
        const locale = (post.primary_locale ?? "en") as "pt" | "en" | "fr";
        const publishedUrl =
          canonical === "published"
            ? buildDgPublishedPostUrl({
                domain: client.domain,
                blog_base_path: (client as { blog_base_path?: string }).blog_base_path ?? "/blog",
                locale,
                slug: post.slug,
              })
            : null;

        const adminUrl = buildDgArticleAdminUrl(post.id, locale);
        const payload = {
          event_id: eventId,
          event_type: "article.status_changed",
          request_id: record.request_id,
          dg_project_id: record.dg_project_id,
          dg_strategy_id: record.dg_strategy_id,
          dg_campaign_id: record.dg_campaign_id,
          cms_site_id: String(record.cms_site_id),
          cms_article_id: post.id,
          status: canonical,
          status_label: dgCanonicalStatusLabel(canonical),
          article_admin_url: adminUrl,
          published_url: publishedUrl,
          error_code: canonical === "failed" ? "archived" : null,
          error_message: null,
          updated_at: new Date().toISOString(),
        };

        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearer}`,
            "Content-Type": "application/json",
            "X-Integration-Source": "ai-cms",
            "X-Request-Id": eventId,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30_000),
        });

        const text = await res.text().catch(() => "");
        if (!res.ok) {
          return {
            ok: false as const,
            error: `HTTP ${res.status}: ${text.slice(0, 400)}`,
          };
        }

        await admin
          .from("dg_integration_records")
          .update({
            last_canonical_status: canonical,
            last_webhook_event_id: eventId,
            last_webhook_sent_at: new Date().toISOString(),
            last_webhook_error: null,
          })
          .eq("id", integrationRecordId);

        return { ok: true as const };
      });

      if (result.ok) {
        return { delivered: true as const, attempts: attempt + 1 };
      }

      lastError = result.error;

      if (attempt < 5) {
        await step.sleep(`dg-webhook-backoff-${attempt}`, BACKOFF_DURATIONS[attempt]);
      }
    }

    await step.run("persist-final-failure", async () => {
      const admin = createAdminClient();
      await admin
        .from("dg_integration_records")
        .update({ last_webhook_error: lastError })
        .eq("id", integrationRecordId);
    });

    return { delivered: false as const, error: lastError };
  },
);
