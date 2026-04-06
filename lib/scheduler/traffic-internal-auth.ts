import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const MAX_SKEW_MS = 120_000;

/**
 * Server-to-server auth for POST /api/scheduler when invoked from GET /api/scheduler/trigger
 * without CRON_SECRET. Uses SUPABASE_SERVICE_ROLE_KEY (already required for admin client).
 */
export function verifyTrafficSchedulerInternalRequest(req: NextRequest): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return false;
  const tsStr = req.headers.get("x-scheduler-internal-ts");
  const sigHex = req.headers.get("x-scheduler-internal-sig");
  if (!tsStr || !sigHex) return false;
  const t = Number.parseInt(tsStr, 10);
  if (!Number.isFinite(t) || Math.abs(Date.now() - t) > MAX_SKEW_MS) return false;
  const expectedHex = createHmac("sha256", key).update(`scheduler:${tsStr}`).digest("hex");
  try {
    const a = Buffer.from(sigHex, "hex");
    const b = Buffer.from(expectedHex, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildTrafficSchedulerInternalHeaders(): Record<string, string> | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  const ts = Date.now().toString();
  const sig = createHmac("sha256", key).update(`scheduler:${ts}`).digest("hex");
  return {
    "x-scheduler-internal-ts": ts,
    "x-scheduler-internal-sig": sig,
  };
}
