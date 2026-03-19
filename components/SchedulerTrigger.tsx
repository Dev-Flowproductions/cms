"use client";

import { useEffect, useRef } from "react";

/**
 * On mount, pings /api/scheduler/trigger so the scheduler runs when the app gets traffic.
 * Rate-limited there to every 15 min. The scheduler checks last_post_generated_at + frequency
 * per client and only generates for due clients — no cron required.
 */
export function SchedulerTrigger() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    fetch("/api/scheduler/trigger", { method: "GET" }).catch(() => {});
  }, []);
  return null;
}
