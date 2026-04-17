import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicAppBaseUrlOrLocalhost } from "@/lib/public-app-url";
import { buildTrafficSchedulerInternalHeaders } from "@/lib/scheduler/traffic-internal-auth";

const RATE_LIMIT_MINUTES = 15;

/**
 * GET /api/scheduler/trigger
 *
 * Called when the app receives traffic (e.g. from root layout). Rate-limited so we
 * only start the scheduler at most every RATE_LIMIT_MINUTES. The scheduler itself
 * checks last_post_generated_at + frequency per client and only generates for due clients.
 * No cron required: "when the time is right" is "next time the app is hit after the rate limit".
 * Invokes POST /api/scheduler with Bearer CRON_SECRET when set, else HMAC headers derived from
 * SUPABASE_SERVICE_ROLE_KEY (previously, missing CRON_SECRET meant the trigger claimed the slot but never ran).
 * For zero-traffic sites, add Vercel Cron or an external ping to this URL or POST /api/scheduler.
 */
export async function GET() {
  const admin = createAdminClient();

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const cutoffIso = new Date(now - RATE_LIMIT_MINUTES * 60 * 1000).toISOString();

  // Single atomic update so concurrent requests cannot both pass the rate limit
  // (read-then-update allowed double /api/scheduler POSTs).
  const { data: claimed, error: updateError } = await admin
    .from("scheduler_meta")
    .update({ last_trigger_at: nowIso })
    .eq("id", 1)
    .or(`last_trigger_at.is.null,last_trigger_at.lt."${cutoffIso}"`)
    .select("id");

  if (updateError) {
    console.error("[scheduler/trigger] Failed to claim scheduler_meta:", updateError.message);
    return NextResponse.json({ ok: true, triggered: false });
  }

  if (!claimed?.length) {
    return NextResponse.json({ ok: true, triggered: false, rate_limited: true });
  }

  // Prefer the stable custom domain (NEXT_PUBLIC_APP_URL) so the call always
  // reaches the correct production endpoint, not a deployment-specific URL.
  const origin = getPublicAppBaseUrlOrLocalhost();
  const cronSecret = process.env.CRON_SECRET;
  const url = `${origin}/api/scheduler`;

  const headers: Record<string, string> = {};
  if (cronSecret) {
    headers.Authorization = `Bearer ${cronSecret}`;
  } else {
    const internal = buildTrafficSchedulerInternalHeaders();
    if (internal) {
      Object.assign(headers, internal);
    } else {
      console.error(
        "[scheduler/trigger] Cannot invoke POST /api/scheduler: set CRON_SECRET or SUPABASE_SERVICE_ROLE_KEY (traffic-based scheduling was a no-op before this was fixed).",
      );
      return NextResponse.json({
        ok: true,
        triggered: true,
        scheduler_invoked: false,
        reason: "missing_cron_secret_and_service_role",
      });
    }
  }

  fetch(url, { method: "POST", headers }).catch((err) =>
    console.error("[scheduler/trigger] Failed to invoke scheduler:", err),
  );

  return NextResponse.json({ ok: true, triggered: true, scheduler_invoked: true });
}
