import { inngest } from "./client";
import { getPublicAppBaseUrlOrLocalhost } from "@/lib/public-app-url";

function getAppBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return getPublicAppBaseUrlOrLocalhost();
}

/**
 * Runs every 10 minutes and triggers the post scheduler (generates posts for due clients).
 * Replaces Vercel Cron so we can run every 10 min on Hobby.
 */
export const runScheduler = inngest.createFunction(
  {
    id: "run-scheduler",
    triggers: [{ cron: "*/2 * * * *" }],
    retries: 2,
  },
  async ({ step }) => {
    const baseUrl = getAppBaseUrl();
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      throw new Error("CRON_SECRET is not set");
    }

    const res = await step.run("trigger-scheduler", async () => {
      const r = await fetch(`${baseUrl}/api/scheduler`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cronSecret}` },
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
