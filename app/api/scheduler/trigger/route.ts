import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT_MINUTES = 15;

/**
 * GET /api/scheduler/trigger
 *
 * Called when the app receives traffic (e.g. from root layout). Rate-limited so we
 * only start the scheduler at most every RATE_LIMIT_MINUTES. The scheduler itself
 * checks last_post_generated_at + frequency per client and only generates for due clients.
 * No cron required: "when the time is right" is "next time the app is hit after the rate limit".
 * For zero-traffic setups, call this URL from an external cron (e.g. once per hour).
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

  const origin =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cronSecret = process.env.CRON_SECRET;
  const url = `${origin}/api/scheduler`;

  if (cronSecret) {
    fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${cronSecret}` },
    }).catch((err) => console.error("[scheduler/trigger] Failed to invoke scheduler:", err));
  }

  return NextResponse.json({ ok: true, triggered: true });
}
