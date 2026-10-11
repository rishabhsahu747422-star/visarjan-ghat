import { useEffect, useState } from "react";
import { api, Festival, RankedGhat, RankingResponse, Summary } from "./api";
import Brief from "./pages/Brief";

// Plain-words labels. "good" recovery means "no worse than before", never "clean" (DECISIONS D-15, D-21).
function recoveryText(g: RankedGhat): string {
  if (g.recovery === "poor") return "Worse a week later";
  if (g.recovery === "unknown") return "After immersion: not measured";
  return g.after_severity && g.after_severity > 0
    ? "No worse a week later, still above limits"
    : "Within limits a week later";
}

const QUADRANT_TEXT: Record<RankedGhat["quadrant"], string> = {
  already_bad: "Poor before immersion",
  damaged_by_immersion: "Worse during immersion",
  both: "Poor before, worse during",
  stable: "No clear rise during immersion",
  unknown: "Phases not comparable",
};

export default function App() {
  const [festival, setFestival] = useState<Festival>("Durga"); // Durga first: it is the upcoming festival
  const [summary, setSummary] = useState<Summary | null>(null);
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.summary().then(setSummary).catch(() =>
      setError("Cannot reach the API. Start the backend (see README) or check VITE_API_BASE_URL."));
  }, []);

  useEffect(() => {
    setRanking(null);
    api.ranking(festival).then(setRanking).catch(() =>
      setError("Cannot load the ranking. Start the backend (see README) or check VITE_API_BASE_URL."));
  }, [festival]);

  return (
    <div className="page">
      <header>
        <h1>Visarjan Ghat Watch</h1>
        <div className="toggle" role="group" aria-label="Festival">
          {(["Durga", "Ganesh"] as Festival[]).map((f) => (
            <button key={f} aria-pressed={festival === f} onClick={() => setFestival(f)}>{f}</button>
          ))}
        </div>
      </header>

      {error && <p className="notice">{error}</p>}

      {summary && (
        <p className="muted">
          {summary.rows} readings loaded. Dissolved oxygen below 5 mg/l: {summary.do_below_5} of {summary.do_readings}.
        </p>
      )}

      <ol className="ghats">
        {ranking?.ranking.map((g) => (
          <li key={g.site}>
            <strong>{g.rank}. {g.site}</strong> · {g.risk_level} risk
            <div>{g.reason}</div>
            <div className="muted">
              {QUADRANT_TEXT[g.quadrant]} · {recoveryText(g)} · {g.confidence.level} confidence
              {g.confidence.reasons.length > 0 && ` (${g.confidence.reasons.join("; ")})`}
              {" "}· latest data {g.latest_data_year}
            </div>
          </li>
        ))}
      </ol>

      {ranking && ranking.no_data_sites.length > 0 && (
        <>
          <h2>No data</h2>
          <ul className="ghats">
            {ranking.no_data_sites.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                <div className="muted">{s.note ?? "No baseline, test before use"}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Brief festival={festival} />
    </div>
  );
}
