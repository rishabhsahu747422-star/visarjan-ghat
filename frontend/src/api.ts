const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export type Festival = "Durga" | "Ganesh";

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

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  ghats: () => get<GhatsResponse>("/api/ghats"),
  summary: () => get<Summary>("/api/summary"),
  // TODO: replace `unknown` with the ranking type once scoring.py is implemented.
  ranking: (festival: Festival) => get<{ festival: Festival; ranking: unknown[] }>(`/api/ranking?festival=${festival}`),
};
