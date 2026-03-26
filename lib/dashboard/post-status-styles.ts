/** Shared badge colours for post pipeline status (dashboard + admin tables). */
export const POST_STATUS_BADGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  idea: { bg: "rgba(120,120,160,0.12)", text: "var(--text-muted)", dot: "var(--text-muted)" },
  research: { bg: "rgba(99,179,237,0.1)", text: "#63b3ed", dot: "#63b3ed" },
  draft: { bg: "rgba(245,166,35,0.1)", text: "#f5a623", dot: "#f5a623" },
  optimize: { bg: "rgba(255,128,72,0.1)", text: "#ff8048", dot: "#ff8048" },
  format: { bg: "rgba(124,92,252,0.12)", text: "#a78bfa", dot: "#a78bfa" },
  review: { bg: "rgba(240,98,146,0.1)", text: "#f06292", dot: "#f06292" },
  approved: { bg: "rgba(34,211,160,0.1)", text: "#22d3a0", dot: "#22d3a0" },
  scheduled: { bg: "rgba(99,102,241,0.1)", text: "#818cf8", dot: "#818cf8" },
  published: { bg: "rgba(34,211,160,0.12)", text: "#22d3a0", dot: "#22d3a0" },
  archived: { bg: "rgba(255,92,106,0.1)", text: "#ff5c6a", dot: "#ff5c6a" },
};
