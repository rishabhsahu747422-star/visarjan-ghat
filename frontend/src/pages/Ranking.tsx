/**
 * The first screen: which ghats need attention, and why.
 * Risk level, one-line reason, confidence badge and the quadrant chart.
 *
 * Missing data is grey and labelled, never green and never low risk.
 */
import { RankingResponse, Summary } from "../api";
import { BMC_TEXT, QUADRANT_TEXT, RISK_CLASS, num, recoveryText } from "../labels";
import QuadrantChart from "../components/QuadrantChart";

export default function Ranking({
  ranking,
  summary,
  error,
  onSelect,
}: {
  ranking: RankingResponse | null;
  summary: Summary | null;
  error: string | null;
  onSelect: (site: string) => void;
}) {
  if (error) return <p className="notice">{error}</p>;

  if (!ranking) {
    return (
      <div className="skeleton-list" aria-busy="true" aria-live="polite">
        <p className="muted">Loading the ranking…</p>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <section className="fade-in">
      {summary && (
        <p className="lede">
          {summary.rows.toLocaleString()} readings from the MPPCB visarjan reports.{" "}
          <strong>{summary.do_below_5} of {summary.do_readings}</strong> dissolved-oxygen readings are
          below 5 mg/l and <strong>{summary.bod_above_3} of {summary.bod_readings}</strong> BOD
          readings are above 3 mg/l.
        </p>
      )}

      <ol className="ghat-list">
        {ranking.ranking.map((g) => (
          <li key={g.site}>
            <button className="ghat-card" onClick={() => onSelect(g.site)}>
              <span className="ghat-rank">{g.rank}</span>
              <span className="ghat-main">
                <span className="ghat-title">
                  <span className="ghat-name">{g.site}</span>
                  <span className={`pill ${RISK_CLASS[g.risk_level]}`}>{g.risk_level} risk</span>
                  <span className={`pill conf conf-${g.confidence.level.toLowerCase()}`}>
                    {g.confidence.level} confidence
                  </span>
                </span>
                <span className="ghat-reason">{g.reason}</span>
                <span className="ghat-meta">
                  {g.water_body} · {QUADRANT_TEXT[g.quadrant]} · {recoveryText(g)} · latest data{" "}
                  {g.latest_data_year} · {BMC_TEXT[g.bmc_list_2026]}
                </span>
                {g.confidence.reasons.length > 0 && (
                  <span className="ghat-conf-why">Why: {g.confidence.reasons.join("; ")}</span>
                )}
              </span>
              <span className="ghat-score">
                <span className="score-value">{num(g.risk_score)}</span>
                <span className="score-label">risk score</span>
                {g.test_priority !== null && (
                  <span className="score-sub">test priority {num(g.test_priority)}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <h2>Already polluted, or made worse by immersion?</h2>
      <QuadrantChart ranking={ranking.ranking} onSelect={onSelect} />

      {ranking.no_data_sites.length > 0 && (
        <>
          <h2>No data</h2>
          <ul className="nodata-list">
            {ranking.no_data_sites.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong>
                <span className="muted"> {s.note ?? "No baseline, test before use."}</span>
              </li>
            ))}
          </ul>
          <p className="missing-note">
            A ghat with no readings is not a clean ghat. It is untested.
          </p>
        </>
      )}

      <p className="muted small">
        Formula {ranking.formula_version}. Ranking uses DO, BOD and pH against CPCB Class B limits,
        weighted during 0.5, a week after 0.3, before 0.2, and weighted towards recent years. Past
        readings only; this is not a forecast and not a health assessment.
      </p>
    </section>
  );
}
