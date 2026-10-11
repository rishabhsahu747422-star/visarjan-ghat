// Plain-words labels shared by every page. Wording is fixed by docs/DECISIONS.md:
//   - "good" recovery means NO WORSE than before immersion, never "clean"/"recovered" (D-15, D-21)
//   - quadrant "stable" means no clear rise during immersion, never "within limits" (D-19)
//   - missing data is never phrased as low risk or clean (PRD s6)
// No health wording anywhere.
import { Quadrant, RankedGhat, RiskLevel } from "./api";

export const QUADRANT_TEXT: Record<Quadrant, string> = {
  already_bad: "Poor before immersion",
  damaged_by_immersion: "Worse during immersion",
  both: "Poor before, worse during",
  stable: "No clear rise during immersion",
  unknown: "Phases not comparable",
};

export const PHASE_TEXT: Record<string, string> = {
  pre: "Before",
  during: "During",
  after: "A week after",
};

export const STATUS_TEXT: Record<string, string> = {
  measured: "Measured",
  below_detection: "Below detection",
  missing: "Not measured",
};

export function recoveryText(g: Pick<RankedGhat, "recovery" | "after_severity">): string {
  if (g.recovery === "poor") return "Worse a week later";
  if (g.recovery === "unknown") return "After immersion: not measured";
  return g.after_severity !== null && g.after_severity > 0
    ? "No worse a week later, still above limits"
    : "Within limits a week later";
}

export const RISK_CLASS: Record<RiskLevel, string> = {
  Low: "risk-low",
  Medium: "risk-mid",
  High: "risk-high",
};

export const BMC_TEXT: Record<RankedGhat["bmc_list_2026"], string> = {
  listed: "On the 2026 news list",
  not_listed: "Not on the 2026 news list",
  unknown: "2026 list: unknown",
};

/** Short parameter label used in charts and tables. */
export function paramShort(parameter: string): string {
  if (parameter === "Dissolved oxygen") return "DO";
  return parameter;
}

/** "Report 2024, page 60" — every number on screen carries its year and page. */
export function sourceText(year: number, sourcePage: number | null): string {
  return sourcePage === null ? `Report ${year}, page not recorded` : `Report ${year}, page ${sourcePage}`;
}

/** Format a value for display. null is never shown as 0. */
export function num(v: number | null, digits = 2): string {
  if (v === null) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(digits).replace(/\.?0+$/, "");
}

/** Signed delta, e.g. "+2.0". null -> em dash. */
export function delta(v: number | null): string {
  if (v === null) return "—";
  const s = num(v);
  return v > 0 ? `+${s}` : s;
}
