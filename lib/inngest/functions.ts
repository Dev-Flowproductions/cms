import { inngest } from "./client";
import { getPublicAppBaseUrlOrLocalhost } from "@/lib/public-app-url";
import { buildTrafficSchedulerInternalHeaders } from "@/lib/scheduler/traffic-internal-auth";

function getAppBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return getPublicAppBaseUrlOrLocalhost();
}

function schedulerPostHeaders(): Record<string, string> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    return { Authorization: `Bearer ${cronSecret}` };
  }
  const internal = buildTrafficSchedulerInternalHeaders();
  if (internal) {
    return internal;
  }
  throw new Error(
    "Set CRON_SECRET or SUPABASE_SERVICE_ROLE_KEY so Inngest can POST /api/scheduler.",
  );
}

/**
 * Runs every 2 minutes and POSTs /api/scheduler (due clients get generated).
 * Uses Inngest instead of Vercel Cron (works on Hobby). Same auth as traffic trigger:
 * Bearer CRON_SECRET, or HMAC headers when only the service role key is available.
 */
export const runScheduler = inngest.createFunction(
  {
    id: "run-scheduler",
    triggers: [{ cron: "*/2 * * * *" }],
    retries: 2,
  },
  async ({ step }) => {
    const baseUrl = getAppBaseUrl();
    const headers = schedulerPostHeaders();

    const res = await step.run("trigger-scheduler", async () => {
      const r = await fetch(`${baseUrl}/api/scheduler`, {
        method: "POST",
        headers,
      });
      const body = await r.json().catch(() => ({}));
      return { ok: r.ok, status: r.status, body };
    });

    if (!res.ok) {
      throw new Error(`Scheduler returned ${res.status}: ${JSON.stringify(res.body)}`);
    }
    return res;
  }
);
