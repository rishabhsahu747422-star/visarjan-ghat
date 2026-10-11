/**
 * Baseline pollution (x) against immersion damage (y), one dot per ghat.
 * This is the differentiator in PRD G2: it separates "already bad" from "made worse by immersion".
 *
 * Thresholds mirror scoring.py (QUAD_BASELINE_THRESH 0.3, QUAD_DAMAGE_THRESH 0.1).
 * A ghat with a null baseline or null damage is NEVER plotted at 0; it is listed
 * under the chart as "phases not comparable".
 */
import { RankedGhat } from "../api";
import { RISK_CLASS } from "../labels";

const W = 640;
const H = 380;
const PAD = { top: 28, right: 20, bottom: 52, left: 62 };

const BASELINE_THRESH = 0.3;
const DAMAGE_THRESH = 0.1;

export default function QuadrantChart({
  ranking,
  selected,
  onSelect,
}: {
  ranking: RankedGhat[];
  selected?: string | null;
  onSelect?: (site: string) => void;
}) {
  const plotted = ranking.filter(
    (g) => g.baseline_severity !== null && g.immersion_damage !== null
  );
  const unplotted = ranking.filter(
    (g) => g.baseline_severity === null || g.immersion_damage === null
  );

  // x is always the full severity range. y is data-driven because immersion damage is
  // small in this dataset; the 0.1 threshold line must stay visible inside the plot.
  const maxDamage = plotted.reduce((m, g) => Math.max(m, g.immersion_damage ?? 0), 0);
  const yMax = Math.max(DAMAGE_THRESH * 1.25, maxDamage * 1.2);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (v: number) => PAD.left + v * innerW;
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH;

  const xTicks = [0, 0.25, 0.5, 0.75, 1];
  const yTicks = [0, yMax / 2, yMax];

  return (
    <figure className="chart-figure">
      <figcaption className="chart-caption">
        Already polluted (right) against made worse by immersion (up). Each dot is one ghat.
      </figcaption>
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Scatter chart: baseline pollution against immersion damage, one dot per ghat"
      >
        {/* quadrant backgrounds */}
        <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} className="plot-bg" />
        <rect
          x={x(BASELINE_THRESH)}
          y={PAD.top}
          width={x(1) - x(BASELINE_THRESH)}
          height={y(DAMAGE_THRESH) - PAD.top}
          className="quad-worst"
        />

        {/* threshold lines */}
        <line x1={x(BASELINE_THRESH)} y1={PAD.top} x2={x(BASELINE_THRESH)} y2={PAD.top + innerH} className="thresh" />
        <line x1={PAD.left} y1={y(DAMAGE_THRESH)} x2={PAD.left + innerW} y2={y(DAMAGE_THRESH)} className="thresh" />

        {/* quadrant labels */}
        <text x={x(BASELINE_THRESH) + 8} y={PAD.top + 16} className="quad-label">Poor before, worse during</text>
        <text x={PAD.left + 8} y={PAD.top + 16} className="quad-label">Worse during immersion</text>
        <text x={x(BASELINE_THRESH) + 8} y={PAD.top + innerH - 8} className="quad-label">Poor before immersion</text>
        <text x={PAD.left + 8} y={PAD.top + innerH - 8} className="quad-label">No clear rise</text>

        {/* axes */}
        <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} className="axis" />
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} className="axis" />

        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={x(t)} y1={PAD.top + innerH} x2={x(t)} y2={PAD.top + innerH + 5} className="axis" />
            <text x={x(t)} y={PAD.top + innerH + 19} className="tick" textAnchor="middle">{t}</text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={PAD.left - 5} y1={y(t)} x2={PAD.left} y2={y(t)} className="axis" />
            <text x={PAD.left - 9} y={y(t) + 4} className="tick" textAnchor="end">{t.toFixed(2)}</text>
          </g>
        ))}

        <text x={PAD.left + innerW / 2} y={H - 10} className="axis-title" textAnchor="middle">
          Pollution before immersion (0 = within limits, 1 = far past)
        </text>
        <text
          x={-(PAD.top + innerH / 2)}
          y={14}
          className="axis-title"
          textAnchor="middle"
          transform="rotate(-90)"
        >
          Rise during immersion
        </text>

        {/* dots */}
        {plotted.map((g) => {
          const cx = x(g.baseline_severity as number);
          const cy = y(g.immersion_damage as number);
          const isSel = selected === g.site;
          return (
            <g
              key={g.site}
              className={`dot ${RISK_CLASS[g.risk_level]} ${isSel ? "dot-selected" : ""}`}
              onClick={onSelect ? () => onSelect(g.site) : undefined}
              tabIndex={onSelect ? 0 : -1}
              role={onSelect ? "button" : undefined}
              onKeyDown={
                onSelect
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(g.site);
                      }
                    }
                  : undefined
              }
            >
              <title>
                {`${g.site}: before ${(g.baseline_severity as number).toFixed(2)}, rise during ${(g.immersion_damage as number).toFixed(2)}, ${g.risk_level} risk`}
              </title>
              <circle cx={cx} cy={cy} r={isSel ? 11 : 8} />
              <text x={cx} y={cy - 14} className="dot-label" textAnchor="middle">{g.rank}</text>
            </g>
          );
        })}
      </svg>

      <ol className="chart-key">
        {plotted.map((g) => (
          <li key={g.site}>
            <span className={`key-dot ${RISK_CLASS[g.risk_level]}`} aria-hidden="true" />
            {g.rank}. {g.site}
          </li>
        ))}
      </ol>

      {unplotted.length > 0 && (
        <p className="missing-note">
          Not plotted (phases not comparable, never shown at zero):{" "}
          {unplotted.map((g) => g.site).join(", ")}.
        </p>
      )}
    </figure>
  );
}
