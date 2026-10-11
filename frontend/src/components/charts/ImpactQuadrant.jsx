import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import ConfidenceBadge from '../ui/ConfidenceBadge';

export default function ImpactQuadrant({ ghats = [], className = '' }) {
  const navigate = useNavigate();
  const [hoveredGhat, setHoveredGhat] = useState(null);

  // Plottable points must have both baselineSeverity and immersionDamage
  const plottableGhats = ghats.filter(
    (g) => g.baselineSeverity !== null && g.immersionDamage !== null
  );
  const excludedGhats = ghats.filter(
    (g) => g.baselineSeverity === null || g.immersionDamage === null
  );

  // Coordinate mapping for SVG (X: 0 to 1 -> SVG x: 80 to 520, Y: 0 to 0.7 -> SVG y: 340 to 60)
  const svgWidth = 600;
  const svgHeight = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };

  const plotW = svgWidth - padding.left - padding.right;
  const plotH = svgHeight - padding.top - padding.bottom;

  // Domain: X: 0 to 1, Y: 0 to 0.6
  const xThreshold = 0.35;
  const yThreshold = 0.15;

  const toSvgX = (val) => padding.left + Math.min(1, Math.max(0, val)) * plotW;
  const toSvgY = (val) => padding.top + plotH - (Math.min(0.6, Math.max(0, val)) / 0.6) * plotH;

  const thresholdX = toSvgX(xThreshold);
  const thresholdY = toSvgY(yThreshold);

  return (
    <div className={`bg-white rounded-2xl border border-forest/15 shadow-card p-6 flex flex-col ${className}`}>
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-charcoal font-sans flex items-center gap-2">
              The Impact Quadrant
              <span className="w-2 h-2 rounded-full bg-bright-yellow"></span>
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-pale-green text-forest border border-forest/20">
              Signature Matrix
            </span>
          </div>
          <p className="text-xs text-muted-grey mt-1">
            Separating pre-immersion baseline conditions (X-axis) from immersion-induced deterioration (Y-axis).
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-critical"></span>
            <span className="text-muted-grey">Combined Concern</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-golden-yellow"></span>
            <span className="text-muted-grey">Immersion Impact</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22]"></span>
            <span className="text-muted-grey">Already Poor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-forest"></span>
            <span className="text-muted-grey">Lower Observed</span>
          </div>
        </div>
      </div>

      {/* Main Quadrant Canvas */}
      <div className="relative mt-4 w-full aspect-[4/3] sm:aspect-[16/10] max-h-[480px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none"
        >
          {/* Subtle Grid Pattern */}
          <defs>
            <pattern id="quad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#285032" strokeWidth="0.5" strokeOpacity="0.04" />
            </pattern>
          </defs>
          <rect
            x={padding.left}
            y={padding.top}
            width={plotW}
            height={plotH}
            fill="url(#quad-grid)"
          />

          {/* Quadrant Background Zones */}
          {/* Top-Left: Immersion Impact (Low baseline, High immersion damage) */}
          <rect
            x={padding.left}
            y={padding.top}
            width={thresholdX - padding.left}
            height={thresholdY - padding.top}
            fill="#FFB900"
            fillOpacity="0.05"
          />
          {/* Top-Right: Combined Concern (High baseline, High immersion damage) */}
          <rect
            x={thresholdX}
            y={padding.top}
            width={padding.left + plotW - thresholdX}
            height={thresholdY - padding.top}
            fill="#D9534F"
            fillOpacity="0.06"
          />
          {/* Bottom-Left: Lower Observed Impact (Low baseline, Low immersion damage) */}
          <rect
            x={padding.left}
            y={thresholdY}
            width={thresholdX - padding.left}
            height={padding.top + plotH - thresholdY}
            fill="#285032"
            fillOpacity="0.04"
          />
          {/* Bottom-Right: Already Poor (High baseline, Low immersion damage) */}
          <rect
            x={thresholdX}
            y={thresholdY}
            width={padding.left + plotW - thresholdX}
            height={padding.top + plotH - thresholdY}
            fill="#E67E22"
            fillOpacity="0.05"
          />

          {/* Quadrant Dividing Lines */}
          <line
            x1={thresholdX}
            y1={padding.top}
            x2={thresholdX}
            y2={padding.top + plotH}
            stroke="#285032"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeOpacity="0.3"
          />
          <line
            x1={padding.left}
            y1={thresholdY}
            x2={padding.left + plotW}
            y2={thresholdY}
            stroke="#285032"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeOpacity="0.3"
          />

          {/* Quadrant Region Watermarks / Text */}
          <text
            x={padding.left + 16}
            y={padding.top + 24}
            className="text-[11px] font-mono fill-[#A57800] uppercase font-bold tracking-wider"
          >
            Immersion Impact
          </text>
          <text
            x={padding.left + 16}
            y={padding.top + 38}
            className="text-[9px] fill-muted-grey font-sans"
          >
            Lower baseline · rises during immersion
          </text>

          <text
            x={padding.left + plotW - 16}
            y={padding.top + 24}
            textAnchor="end"
            className="text-[11px] font-mono fill-risk-critical uppercase font-bold tracking-wider"
          >
            Combined Concern
          </text>
          <text
            x={padding.left + plotW - 16}
            y={padding.top + 38}
            textAnchor="end"
            className="text-[9px] fill-muted-grey font-sans"
          >
            Poor baseline + Severe immersion spike
          </text>

          <text
            x={padding.left + 16}
            y={padding.top + plotH - 30}
            className="text-[11px] font-mono fill-forest uppercase font-bold tracking-wider"
          >
            Lower Observed Impact
          </text>
          <text
            x={padding.left + 16}
            y={padding.top + plotH - 16}
            className="text-[9px] fill-muted-grey font-sans"
          >
            Closer to CPCB Class B bathing standard
          </text>

          <text
            x={padding.left + plotW - 16}
            y={padding.top + plotH - 30}
            textAnchor="end"
            className="text-[11px] font-mono fill-[#C06014] uppercase font-bold tracking-wider"
          >
            Already Poor
          </text>
          <text
            x={padding.left + plotW - 16}
            y={padding.top + plotH - 16}
            textAnchor="end"
            className="text-[9px] fill-muted-grey font-sans"
          >
            DO and BOD already past the limit before immersion
          </text>

          {/* Axes Lines */}
          <line
            x1={padding.left}
            y1={padding.top + plotH}
            x2={padding.left + plotW}
            y2={padding.top + plotH}
            stroke="#222222"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotH}
            stroke="#222222"
            strokeWidth="1.5"
          />

          {/* X-Axis Ticks & Label */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((t) => {
            const x = toSvgX(t);
            return (
              <g key={`x-${t}`}>
                <line
                  x1={x}
                  y1={padding.top + plotH}
                  x2={x}
                  y2={padding.top + plotH + 5}
                  stroke="#777777"
                />
                <text
                  x={x}
                  y={padding.top + plotH + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-muted-grey font-mono"
                >
                  {(t * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
          <text
            x={padding.left + plotW / 2}
            y={svgHeight - 12}
            textAnchor="middle"
            className="text-xs font-semibold fill-charcoal font-sans"
          >
            Baseline Pre-Immersion Breach Severity →
          </text>

          {/* Y-Axis Ticks & Label */}
          {[0, 0.15, 0.3, 0.45, 0.6].map((t) => {
            const y = toSvgY(t);
            return (
              <g key={`y-${t}`}>
                <line
                  x1={padding.left - 5}
                  y1={y}
                  x2={padding.left}
                  y2={y}
                  stroke="#777777"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-muted-grey font-mono"
                >
                  {(t * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
          <text
            x={-(padding.top + plotH / 2)}
            y={24}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-xs font-semibold fill-charcoal font-sans"
          >
            ↑ Immersion Damage (During − Pre Severity)
          </text>

          {/* Plotted Ghat Points */}
          {plottableGhats.map((g) => {
            const cx = toSvgX(g.baselineSeverity);
            const cy = toSvgY(g.immersionDamage);
            const isHovered = hoveredGhat?.site === g.site;

            let dotColor = '#285032';
            // Keyed off the API enum, not a label, so renaming a label can never silently
            // change what a dot means.
            if (g.quadrantKey === 'both') dotColor = '#D9534F';
            else if (g.quadrantKey === 'damaged_by_immersion') dotColor = '#FFB900';
            else if (g.quadrantKey === 'already_bad') dotColor = '#E67E22';

            return (
              <g
                key={g.site}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredGhat(g)}
                onMouseLeave={() => setHoveredGhat(null)}
                onClick={() => navigate(`/app/ghat/${g.slug}`)}
              >
                {/* Ripple ring when hovered */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="16"
                    fill="none"
                    stroke={dotColor}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-spin"
                  />
                )}

                {/* Outer Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 9 : 7}
                  fill="#FFFFFF"
                  stroke={dotColor}
                  strokeWidth="2.5"
                />
                {/* Core Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3.5}
                  fill={dotColor}
                />

                {/* Text Label on Canvas */}
                <text
                  x={cx + 10}
                  y={cy - 4}
                  className={`text-[11px] font-sans transition-all ${
                    isHovered
                      ? 'font-bold fill-forest underline'
                      : 'font-medium fill-charcoal/90'
                  }`}
                >
                  {g.site.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Interactive Tooltip */}
        {hoveredGhat && (
          <div
            className="absolute z-20 pointer-events-none bg-white p-3.5 rounded-xl border border-forest/20 shadow-elevated text-xs space-y-1.5 min-w-[220px]"
            style={{
              left: `${Math.min(70, Math.max(10, (toSvgX(hoveredGhat.baselineSeverity) / svgWidth) * 100))}%`,
              top: `${Math.max(10, (toSvgY(hoveredGhat.immersionDamage) / svgHeight) * 100 - 30)}%`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-forest/10 pb-1.5">
              <span className="font-bold text-charcoal">{hoveredGhat.site}</span>
              <span className="font-mono text-[10px] text-muted-grey">{hoveredGhat.water_body}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono pt-1">
              <div>
                <span className="text-muted-grey block text-[10px]">Baseline Breach:</span>
                <span className="font-semibold text-charcoal">
                  {(hoveredGhat.baselineSeverity * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-muted-grey block text-[10px]">Immersion Delta:</span>
                <span className="font-semibold text-charcoal">
                  +{(hoveredGhat.immersionDamage * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="px-2 py-0.5 rounded bg-pale-green text-forest font-semibold">
                {hoveredGhat.quadrant}
              </span>
              <span className="text-forest text-[10px] font-semibold flex items-center gap-0.5">
                Click to explore <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Disclosures & Excluded Ghats Note */}
      <div className="mt-4 pt-3 border-t border-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-grey">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-forest shrink-0" />
          <span>
            {plottableGhats.length} ghats plotted with verified pre and during observations.
            A ghat with a missing phase is left off the chart, never plotted at 0.
          </span>
        </div>

        {excludedGhats.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-risk-warning font-mono">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>
              {excludedGhats.length} sites excluded due to incomplete paired observations (e.g. {excludedGhats.map(g => g.site.split(' ')[0]).join(', ')})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
