import { useEffect, useState } from "react";
import { api, Festival, GhatsResponse, Summary } from "./api";

export default function App() {
  const [festival, setFestival] = useState<Festival>("Durga"); // Durga first: it is the upcoming festival
  const [ghats, setGhats] = useState<GhatsResponse | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rankingReady, setRankingReady] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.ghats(), api.summary()])
      .then(([g, s]) => { setGhats(g); setSummary(s); })
      .catch(() => setError("Cannot reach the API. Start the backend (see README) or check VITE_API_BASE_URL."));
  }, []);

  useEffect(() => {
    setRankingReady(null);
    api.ranking(festival).then(() => setRankingReady(true)).catch(() => setRankingReady(false));
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

      {rankingReady === false && (
        <p className="notice">Ranking is not built yet. See backend/app/scoring.py.</p>
      )}

      <ul className="ghats">
        {ghats?.ghats.map((g) => (
          <li key={g.site}>
            <strong>{g.site}</strong>
            <div className="muted">{g.water_body} · site match: {g.site_match_confidence}</div>
          </li>
        ))}
        {ghats?.no_data_sites.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong>
            <div className="muted">{s.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
