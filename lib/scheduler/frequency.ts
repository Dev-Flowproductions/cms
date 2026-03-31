export type Frequency = "weekly" | "biweekly" | "monthly";

/** Map legacy DB values (e.g. daily) to a selectable frequency for UI. */
export function normalizeFrequencyForUi(f: string | null | undefined): Frequency {
  if (f === "weekly" || f === "biweekly" || f === "monthly") return f;
  return "weekly";
}
