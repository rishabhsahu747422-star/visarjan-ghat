/**
 * Data and limits: what the numbers are, where they stop, and what this tool does not cover.
 * Text follows PRD section 6 and the README "Limits we state openly". Keep them in step.
 */
import { RankingResponse, Summary } from "../api";

export default function Gaps({
  summary,
  ranking,
}: {
  summary: Summary | null;
  ranking: RankingResponse | null;
}) {
  return (
    <section className="fade-in prose">
      <h2>Data and limits</h2>
      <p className="lede">
        Everything here comes from public MPPCB visarjan reports for 2023, 2024 and 2025 and the CPCB
        water-quality criteria. We state the gaps rather than fill them.
      </p>

      <h3>The numbers we load</h3>
      {summary ? (
        <ul className="facts">
          <li>
            <strong>{summary.rows.toLocaleString()}</strong> reading rows loaded and classified as
            measured, below detection or missing.
          </li>
          <li>
            <strong>{summary.do_below_5} of {summary.do_readings}</strong> dissolved-oxygen readings
            are below 5 mg/l.
          </li>
          <li>
            <strong>{summary.bod_above_3} of {summary.bod_readings}</strong> BOD readings are above
            3 mg/l.
          </li>
          {summary.status_counts && (
            <li>
              Row status:{" "}
              {Object.entries(summary.status_counts)
                .map(([k, v]) => `${k.replace("_", " ")} ${v}`)
                .join(", ")}
              .
            </li>
          )}
        </ul>
      ) : (
        <p className="muted">Loading the counts…</p>
      )}

      <h3>Why CPCB Class B</h3>
      <p>
        Class B is the outdoor-bathing criterion. People stand in the water at an immersion ghat, so
        it is the closest published standard to what happens there. It is a comparison, not a legal
        finding, and not a health assessment.
      </p>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col">Class B limit</th>
              <th scope="col">Assumed unit</th>
              <th scope="col">How we score it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dissolved oxygen (DO)</td>
              <td>at least 5</td>
              <td>mg/l</td>
              <td>(5 − value) ÷ 5, floored at 0, capped at 1</td>
            </tr>
            <tr>
              <td>BOD</td>
              <td>3 or less</td>
              <td>mg/l</td>
              <td>(value − 3) ÷ 3, floored at 0, capped at 1</td>
            </tr>
            <tr>
              <td>pH</td>
              <td>6.5 to 8.5</td>
              <td>pH units</td>
              <td>distance outside the band, per 1.0 unit, capped at 1</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="muted small">
        Every other parameter in the reports (COD, solids, turbidity, conductivity, chromium, lead,
        zinc, copper) has no Class B limit here. We show those readings for context and never count
        them as a breach.
      </p>

      <h3>How a rank is built</h3>
      <ol className="facts">
        <li>Each reading becomes a severity from 0 (within the limit) to 1 (far past it).</li>
        <li>
          Severities are averaged per phase, then weighted: during immersion 0.5, a week after 0.3,
          before 0.2. A phase with no reading is left out, never counted as 0.
        </li>
        <li>Years are weighted towards the recent: 0.5, 0.3, 0.2 from the latest year in the data.</li>
        <li>Risk level: High at 0.50 and above, Medium at 0.25 and above, Low below 0.25.</li>
        <li>
          Test priority = risk score × a data-gap factor (High confidence 1.0, Medium 1.5, Low 2.0).
          It does not change the ranking order.
        </li>
      </ol>

      <h3>Known gaps</h3>
      <ul className="facts">
        <li>
          <strong>Units are not printed</strong> in the reports. We use the standard unit for each
          test, as stated in the data pack.
        </li>
        <li>
          <strong>Few readings per ghat.</strong> Impact and recovery figures are indicative, not
          statistical. Raw values are always shown beside a change.
        </li>
        <li>
          <strong>Bairagarh and Malikhedi have no Durga 2025 table</strong>, and their Ganesh 2025
          data has the <em>during</em> phase only. Both are capped at Low confidence.
        </li>
        <li>
          <strong>Suspended solids are missing</strong> in Durga 2023 and 2025.
        </li>
        <li>
          <strong>Rani Kamlapati ghat and Kamla Park kund may be two places.</strong> We treat them
          as one site and cap its confidence at Medium.
        </li>
        <li>
          <strong>Only four metals were tested</strong> (chromium, lead, zinc, copper), and they have
          no Class B limit here.
        </li>
        <li>
          <strong>The 2026 ghat list is unverified.</strong> It comes from Free Press Journal and The
          Hitavada, 26 Feb 2026, not from a BMC order.
        </li>
      </ul>

      <h3>Ghats with no data</h3>
      {ranking && ranking.no_data_sites.length > 0 ? (
        <ul className="nodata-list">
          {ranking.no_data_sites.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong>
              <span className="muted"> {s.note ?? "No baseline, test before use."}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Loading…</p>
      )}
      <p className="missing-note">
        An untested ghat is not a clean ghat. Missing readings are shown as missing everywhere in
        this tool, and never score as passing.
      </p>

      <h3>What this tool does not do</h3>
      <ul className="facts">
        <li>It does not forecast water quality on 20 Oct 2026. These are past readings.</li>
        <li>It makes no health claims. It reports readings against a published limit.</li>
        <li>It does not use a machine-learning model. Every number traces to a formula above.</li>
        <li>It does not collect new data and holds no personal data.</li>
      </ul>

      <h3>Where the data comes from</h3>
      <ul className="facts">
        <li>MPPCB visarjan monitoring reports 2023, 2024 and 2025 (page numbers are on every reading).</li>
        <li>CPCB water-quality criteria (Class B, outdoor bathing).</li>
        <li>
          Our own working list of 2026 ghats, from news reports, marked unverified.
        </li>
      </ul>
    </section>
  );
}
