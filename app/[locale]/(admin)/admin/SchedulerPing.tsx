"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget: hits /api/scheduler/trigger once per admin page load.
 * The endpoint is rate-limited to at most once every 15 minutes via scheduler_meta,
 * so this is safe to call on every navigation without hammering the scheduler.
 */
export function SchedulerPing() {
  useEffect(() => {
    fetch("/api/scheduler/trigger").catch(() => {
      // Silently ignore — this is a best-effort background trigger
    });
  }, []);
  return null;
}
