/**
 * Same intervals as POST /api/scheduler — keep in sync for countdown UX.
 */
export const FREQUENCY_INTERVAL_MS: Record<string, number> = {
  daily: 1 * 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  biweekly: 14 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

/**
 * Milliseconds until the next scheduled post window (last run + interval).
 * When there is no prior run (or invalid date), aligns with scheduler: treated as due → 0.
 */
export function getMsUntilNextPostDue(
  lastPostGeneratedAt: string | null | undefined,
  frequency: string,
  nowMs = Date.now(),
): number {
  const intervalMs = FREQUENCY_INTERVAL_MS[frequency] ?? FREQUENCY_INTERVAL_MS.weekly;
  const lastRun = lastPostGeneratedAt ? new Date(lastPostGeneratedAt).getTime() : 0;
  const last = Number.isFinite(lastRun) && lastRun > 0 ? lastRun : 0;
  const nextDueMs = last + intervalMs;
  return Math.max(0, nextDueMs - nowMs);
}
