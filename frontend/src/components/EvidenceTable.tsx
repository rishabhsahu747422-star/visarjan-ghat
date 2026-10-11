/**
 * Every reading behind the rank, with the page it came from.
 *
 * Rules held here:
 *   - the value as printed in the report is shown whenever it differs from the parsed number
 *   - "below detection" is shown as text, never as 0
 *   - context-only parameters (no Class B limit) are never marked as a breach
 *   - every row carries "Report {year}, page {n}"
 */
import { useState } from "react";
import { GhatDetail } from "../api";
import { PHASE_TEXT, STATUS_TEXT, sourceText } from "../labels";

const SCORED = ["Dissolved oxygen", "BOD", "pH"];

type Reading = GhatDetail["readings"][number];

function breachCell(r: Reading) {
  if (r.limit === null) return <span className="muted">context only</span>;
  if (r.breach === null) return <span className="muted">—</span>;
  if (r.breach > 0)
    return (
      <span className="breach-yes">
        Past limit<span className="sr-only"> ({r.breach.toFixed(2)} severity)</span>
      </span>
    );
  return <span className="breach-no">Within limit</span>;
}

function valueCell(r: Reading) {
  if (r.status === "below_detection") {
    return (
      <>
        <span className="bdl">Below detection</span>
        {r.value_as_printed ? <span className="as-printed">printed “{r.value_as_printed}”</span> : null}
      </>
    );
  }
  if (r.value === null) return <span className="missing">Not measured</span>;
  const printed = r.value_as_printed;
  const differs = printed !== null && printed !== String(r.value);
  return (
    <>
      <strong>{r.value}</strong>
      {differs ? <span className="as-printed">printed “{printed}”</span> : null}
    </>
  );
}

export default function EvidenceTable({ detail }: { detail: GhatDetail }) {
  const [showAll, setShowAll] = useState(false);

  const rows = detail.readings.filter((r) => showAll || SCORED.includes(r.parameter));
  const contextCount = detail.readings.length - detail.readings.filter((r) => SCORED.includes(r.parameter)).length;

  return (
    <div className="evidence">
      <div className="evidence-head">
        <h3>Every reading, with its source page</h3>
        {contextCount > 0 && (
          <button className="btn-quiet" onClick={() => setShowAll((v) => !v)} aria-pressed={showAll}>
            {showAll ? "Show DO, BOD and pH only" : `Show all parameters (${contextCount} more)`}
          </button>
        )}
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <caption className="sr-only">
            Readings for {detail.site}, {detail.festival} immersion, with Class B limits and source pages
          </caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Phase</th>
              <th scope="col">Parameter</th>
              <th scope="col">Value</th>
              <th scope="col">Class B limit</th>
              <th scope="col">Against limit</th>
              <th scope="col">Status</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.status !== "measured" ? "row-gap" : undefined}>
                <td>{r.year}</td>
                <td>{PHASE_TEXT[r.phase]}</td>
                <td>{r.parameter}</td>
                <td className="num">{valueCell(r)}</td>
                <td>{r.limit ?? <span className="muted">none</span>}</td>
                <td>{breachCell(r)}</td>
                <td>{STATUS_TEXT[r.status]}</td>
                <td className="src">{sourceText(r.year, r.source_page)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && <p className="missing-note">No readings for this ghat.</p>}
      <p className="muted small">
        Units are not printed in the MPPCB reports. We use the standard unit for each test (see Data
        and limits). Parameters with no Class B limit are shown for context only and are never counted
        as a breach.
      </p>
    </div>
  );
}
