/**
 * Before / during / a week after, one line per year, for DO, BOD and pH.
 * The Class B limit is a reference line (a shaded band for pH).
 *
 * Missing values break the line and are named in the caption. They are never drawn at 0,
 * and they are never styled like a good reading (PRD s6: missing is not clean).
 * Below-detection readings have no number to plot, so they are named in the caption too.
 */
import { GhatDetail } from "../api";
import { PHASE_TEXT } from "../labels";

type Phase = "pre" | "during" | "after";
const PHASES: Phase[] = ["pre", "during", "after"];

interface Spec {
  parameter: string;
  label: string;
  unit: string;
  min?: number;
  max?: number;
  limitText: string;
}

const SPECS: Spec[] = [
  {
    parameter: "Dissolved oxygen",
    label: "Dissolved oxygen (DO)",
    unit: "mg/l",
    min: 5,
    limitText: "Class B: at least 5 mg/l",
  },
  { parameter: "BOD", label: "BOD", unit: "mg/l", max: 3, limitText: "Class B: 3 mg/l or less" },
  { parameter: "pH", label: "pH", unit: "", min: 6.5, max: 8.5, limitText: "Class B: 6.5 to 8.5" },
];

const W = 520;
const H = 260;
const PAD = { top: 18, right: 108, bottom: 46, left: 50 };

// Up to three years in the dataset; the series colour is set in styles.css.
const YEAR_CLASS = ["series-a", "series-b", "series-c"];

function niceDomain(values: number[], limits: number[]): [number, number] {
  const all = [...values, ...limits, 0];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const span = hi - lo || 1;
  return [lo - span * 0.08, hi + span * 0.08];
}

export default function PhaseChart({ detail }: { detail: GhatDetail }) {
  const years = [...new Set(detail.readings.map((r) => r.year))].sort();

  return (
    <div className="phase-charts">
      {SPECS.map((spec) => {
        const rows = detail.readings.filter((r) => r.parameter === spec.parameter);
        if (rows.length === 0) {
          return (
            <figure key={spec.parameter} className="chart-figure">
              <figcaption className="chart-caption">{spec.label}</figcaption>
              <p className="missing-note">Not measured for this ghat in any year.</p>
            </figure>
          );
        }

        const measured = rows.filter((r) => r.status === "measured" && r.value !== null);
        const limits = [spec.min, spec.max].filter((v): v is number => v !== undefined);
        const [lo, hi] = niceDomain(
          measured.map((r) => r.value as number),
          limits
        );

        const innerW = W - PAD.left - PAD.right;
        const innerH = H - PAD.top - PAD.bottom;
        const x = (i: number) => PAD.left + (innerW / (PHASES.length - 1)) * i;
        const y = (v: number) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH;

        const chartYears = years.filter((yr) => rows.some((r) => r.year === yr));
        const gaps: string[] = [];
        const bdl: string[] = [];

        const series = chartYears.map((yr, idx) => {
          const points = PHASES.map((ph, i) => {
            const row = rows.find((r) => r.year === yr && r.phase === ph);
            const where = yr + " " + PHASE_TEXT[ph].toLowerCase();
            if (!row) {
              gaps.push(where);
              return null;
            }
            if (row.status === "below_detection") {
              bdl.push(where);
              return null;
            }
            if (row.value === null) {
              gaps.push(where);
              return null;
            }
            return {
              i,
              cx: x(i),
              cy: y(row.value),
              value: row.value,
              phase: ph,
              page: row.source_page,
            };
          });
          return { year: yr, cls: YEAR_CLASS[idx % YEAR_CLASS.length], points };
        });

        const yTicks = [lo, (lo + hi) / 2, hi];

        return (
          <figure key={spec.parameter} className="chart-figure">
            <figcaption className="chart-caption">
              {spec.label} <span className="muted">· {spec.limitText}</span>
            </figcaption>
            <svg
              className="chart"
              viewBox={"0 0 " + W + " " + H}
              role="img"
              aria-label={
                spec.label +
                " before, during and a week after immersion, by year, against the Class B limit"
              }
            >
              <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} className="plot-bg" />

              {/* pH has an allowed band; DO and BOD have a single limit line */}
              {spec.min !== undefined && spec.max !== undefined ? (
                <rect
                  x={PAD.left}
                  y={y(spec.max)}
                  width={innerW}
                  height={Math.max(0, y(spec.min) - y(spec.max))}
                  className="limit-band"
                />
              ) : null}
              {limits.map((lv) => (
                <g key={"lim" + lv}>
                  <line
                    x1={PAD.left}
                    y1={y(lv)}
                    x2={PAD.left + innerW}
                    y2={y(lv)}
                    className="limit-line"
                  />
                  <text x={PAD.left + innerW + 6} y={y(lv) + 4} className="limit-label">
                    {lv}
                  </text>
                </g>
              ))}

              <line
                x1={PAD.left}
                y1={PAD.top + innerH}
                x2={PAD.left + innerW}
                y2={PAD.top + innerH}
                className="axis"
              />
              <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} className="axis" />

              {PHASES.map((ph, i) => (
                <text
                  key={ph}
                  x={x(i)}
                  y={PAD.top + innerH + 20}
                  className="tick"
                  textAnchor="middle"
                >
                  {PHASE_TEXT[ph]}
                </text>
              ))}
              {yTicks.map((t) => (
                <text key={"y" + t} x={PAD.left - 8} y={y(t) + 4} className="tick" textAnchor="end">
                  {t.toFixed(1)}
                </text>
              ))}
              {spec.unit ? (
                <text x={PAD.left - 8} y={PAD.top - 5} className="tick" textAnchor="end">
                  {spec.unit}
                </text>
              ) : null}

              {series.map((s) => {
                // Only join consecutive measured points, so a gap stays a visible gap.
                const segments: string[] = [];
                let current: string[] = [];
                s.points.forEach((p) => {
                  if (p === null) {
                    if (current.length > 1) segments.push(current.join(" L "));
                    current = [];
                  } else {
                    current.push(p.cx + " " + p.cy);
                  }
                });
                if (current.length > 1) segments.push(current.join(" L "));

                return (
                  <g key={s.year} className={"series " + s.cls}>
                    {segments.map((seg, i) => (
                      <path key={i} d={"M " + seg} className="series-line" />
                    ))}
                    {s.points.map((p, i) =>
                      p === null ? null : (
                        <circle key={i} cx={p.cx} cy={p.cy} r={4.5} className="series-dot">
                          <title>
                            {s.year +
                              " " +
                              PHASE_TEXT[p.phase].toLowerCase() +
                              ": " +
                              p.value +
                              (spec.unit ? " " + spec.unit : "") +
                              (p.page !== null ? ", page " + p.page : "")}
                          </title>
                        </circle>
                      )
                    )}
                  </g>
                );
              })}

              {series.map((s, idx) => (
                <g key={"lg" + s.year} className={"series " + s.cls}>
                  <line
                    x1={PAD.left + innerW + 20}
                    y1={PAD.top + 10 + idx * 18}
                    x2={PAD.left + innerW + 40}
                    y2={PAD.top + 10 + idx * 18}
                    className="series-line"
                  />
                  <text x={PAD.left + innerW + 45} y={PAD.top + 14 + idx * 18} className="tick">
                    {s.year}
                  </text>
                </g>
              ))}
            </svg>

            {bdl.length > 0 && (
              <p className="missing-note">
                Below detection (not zero): {[...new Set(bdl)].join(", ")}.
              </p>
            )}
            {gaps.length > 0 && (
              <p className="missing-note">
                Not measured (gap, not zero): {[...new Set(gaps)].join(", ")}.
              </p>
            )}
          </figure>
        );
      })}
    </div>
  );
}
