/**
 * One ghat, end to end: header, phase charts against the limits, the impact table,
 * and every reading with its source page.
 *
 * Deltas are never shown without the raw before / during / after values beside them.
 * A delta that cannot be computed reads "Not measured at both stages", never 0.
 */
import { useEffect, useState } from "react";
import { Festival, GhatDetail, RankedGhat, api } from "../api";
import { BMC_TEXT, QUADRANT_TEXT, RISK_CLASS, delta, num, paramShort, recoveryText } from "../labels";
import PhaseChart from "../components/PhaseChart";
import EvidenceTable from "../components/EvidenceTable";

export default function Detail({
  site,
  festival,
  ranked,
  onBack,
}: {
  site: string | null;
  festival: Festival;
  ranked: RankedGhat | undefined;
  onBack: () => void;
}) {
  const [detail, setDetail] = useState<GhatDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!site) return;
    let cancelled = false;
    setDetail(null);
    setError(null);
    api
      .ghat(site, festival)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(
          e.message === "404"
            ? `No ${festival} readings for ${site}. This ghat is untested for this festival, not clean.`
            : "Could not load this ghat. Check that the backend is running (see README)."
        );
      });
    return () => {
      cancelled = true;
    };
  }, [site, festival]);

  if (!site) {
    return (
      <section className="fade-in">
        <p className="notice">Pick a ghat from the ranked list to see its readings.</p>
      </section>
    );
  }

  return (
    <section className="fade-in detail" id="detail-print-area">
      <button className="btn-quiet back-link no-print" onClick={onBack}>
        ← Back to the ranking
      </button>

      <header className="detail-head">
        <h2>{site}</h2>
        <div className="detail-chips">
          {ranked && (
            <>
              <span className={`pill ${RISK_CLASS[ranked.risk_level]}`}>
                {ranked.risk_level} risk · score {num(ranked.risk_score)}
              </span>
              <span className={`pill conf conf-${ranked.confidence.level.toLowerCase()}`}>
                {ranked.confidence.level} confidence
              </span>
              <span className="pill plain">Rank {ranked.rank} for {festival}</span>
              <span className="pill plain">Latest data {ranked.latest_data_year}</span>
              <span className="pill plain">{BMC_TEXT[ranked.bmc_list_2026]}</span>
            </>
          )}
        </div>
        {ranked && (
          <>
            <p className="detail-reason">{ranked.reason}</p>
            <p className="muted">
              {ranked.water_body} · {QUADRANT_TEXT[ranked.quadrant]} · {recoveryText(ranked)}
              {ranked.confidence.reasons.length > 0 && ` · ${ranked.confidence.reasons.join("; ")}`}
            </p>
          </>
        )}
        <button className="btn-quiet no-print" onClick={() => window.print()}>
          Print this page
        </button>
      </header>

      {error && <p className="notice">{error}</p>}

      {!detail && !error && (
        <p className="muted" aria-busy="true" aria-live="polite">
          Loading readings…
        </p>
      )}

      {detail && (
        <>
          <h3>Before, during and a week after immersion</h3>
          <PhaseChart detail={detail} />

          <h3>What immersion changed</h3>
          {detail.impact.length === 0 ? (
            <p className="missing-note">No DO, BOD or pH readings to compare for this ghat.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <caption className="sr-only">
                  Raw before, during and after values with the change against before
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Year</th>
                    <th scope="col">Parameter</th>
                    <th scope="col">Before</th>
                    <th scope="col">During</th>
                    <th scope="col">A week after</th>
                    <th scope="col">During − before</th>
                    <th scope="col">After − before</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.impact.map((row, i) => (
                    <tr key={i}>
                      <td>{row.year}</td>
                      <td>{paramShort(row.parameter)}</td>
                      <td className="num">{row.pre === null ? <span className="missing">Not measured</span> : num(row.pre)}</td>
                      <td className="num">{row.during === null ? <span className="missing">Not measured</span> : num(row.during)}</td>
                      <td className="num">{row.after === null ? <span className="missing">Not measured</span> : num(row.after)}</td>
                      <td className="num">
                        {row.during_minus_pre === null ? (
                          <span className="missing">Not measured at both stages</span>
                        ) : (
                          delta(row.during_minus_pre)
                        )}
                      </td>
                      <td className="num">
                        {row.after_minus_pre === null ? (
                          <span className="missing">Not measured at both stages</span>
                        ) : (
                          delta(row.after_minus_pre)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="muted small">
            Few readings per ghat, so these changes are indicative, not statistical. For DO a fall is
            worse; for BOD a rise is worse. A blank stage is a gap in the report, not a zero.
          </p>

          <EvidenceTable detail={detail} />
        </>
      )}
    </section>
  );
}
