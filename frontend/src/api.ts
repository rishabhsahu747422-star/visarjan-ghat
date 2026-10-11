const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export type Festival = "Durga" | "Ganesh";
export type RiskLevel = "Low" | "Medium" | "High";
export type Quadrant = "already_bad" | "damaged_by_immersion" | "both" | "stable" | "unknown";
export type Recovery = "good" | "poor" | "unknown";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface Ghat {
  site: string;
  water_body: string;
  site_match_confidence: "high" | "medium";
  bmc_list_2026: "listed" | "not_listed" | "unknown";
}

export interface GhatsResponse {
  ghats: Ghat[];
  no_data_sites: { name: string; bmc_list_2026: string; note: string }[];
  meta_note: string;
}

export interface Summary {
  rows: number;
  do_readings: number;
  do_below_5: number;
  bod_readings: number;
  bod_above_3: number;
}

export interface Evidence {
  year: number;
  phase: "pre" | "during" | "after";
  parameter: string;
  value: number | null;
  status: "measured" | "below_detection" | "missing";
  limit: string | null;
  breach: number | null;
  source_page: number | null;
}

export interface RankedGhat {
  rank: number;
  site: string;
  water_body: string;
  risk_score: number | null;
  risk_level: RiskLevel;
  quadrant: Quadrant;
  baseline_severity: number | null;
  immersion_damage: number | null;
  recovery: Recovery;
  after_severity: number | null; // 0 = within limits; "good" recovery with > 0 is still above limits (D-15)
  latest_data_year: number;
  confidence: { level: ConfidenceLevel; reasons: string[] };
  reason: string;
  bmc_list_2026: "listed" | "not_listed" | "unknown";
  test_priority: number | null;
  evidence: Evidence[];
}

export interface RankingResponse {
  festival: Festival;
  formula_version: string;
  ranking: RankedGhat[];
  no_data_sites: { name: string; note?: string }[];
}

export interface GhatDetail {
  site: string;
  festival: Festival;
  readings: (Evidence & { value_as_printed: string | null })[];
  impact: {
    year: number; parameter: string;
    pre: number | null; during: number | null; after: number | null;
    during_minus_pre: number | null; after_minus_pre: number | null;
  }[];
}

export interface BriefResponse {
  festival: Festival;
  en: string;
  hi: string;
  source: "llm" | "template";
  numbers_validated: boolean;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  ghats: () => get<GhatsResponse>("/api/ghats"),
  summary: () => get<Summary>("/api/summary"),
  ranking: (festival: Festival) => get<RankingResponse>(`/api/ranking?festival=${festival}`),
  ghat: (site: string, festival: Festival) =>
    get<GhatDetail>(`/api/ghat?site=${encodeURIComponent(site)}&festival=${festival}`),
  brief: (festival: Festival) => get<BriefResponse>(`/api/brief?festival=${festival}`),
};
