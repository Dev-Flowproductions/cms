export type Frequency = "every3days" | "weekly" | "biweekly" | "monthly";

/** Map legacy DB values (e.g. daily) to a selectable frequency for UI. */
export function normalizeFrequencyForUi(f: string | null | undefined): Frequency {
  if (f === "every3days" || f === "weekly" || f === "biweekly" || f === "monthly") return f;
  if (f === "daily") return "every3days";
  return "weekly";
}
