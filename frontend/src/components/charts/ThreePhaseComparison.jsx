import React from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { formatDelta } from '../../utils/formatters';

export default function ThreePhaseComparison({ ghatDetail, className = '' }) {
  if (!ghatDetail) return null;

  const {
    baselineSeverity,
    duringSeverity,
    afterSeverity,
    immersionDamage,
    severityDelta,
    recoveryDelta,
    doDelta,
    bodDelta,
    latestPreDO,
    latestDuringDO,
    latestPreBOD,
    latestDuringBOD,
    latestYear,
  } = ghatDetail;

  return (
    <div className={`bg-white rounded-2xl border border-forest/15 shadow-card p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-forest/10">
        <div>
          <h3 className="font-bold text-base text-charcoal font-sans flex items-center gap-2">
            Three-Phase Impact & Recovery Breakdown
            <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
          </h3>
          <p className="text-xs text-muted-grey mt-0.5">
            Evaluating baseline condition vs. immersion stress vs. 1-week post-immersion condition ({latestYear || 'Latest'}).
          </p>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-pale-green text-forest border border-forest/20 self-start sm:self-auto">
          Phase Comparison
        </span>
      </div>

      {/* 3 Phases Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Phase 1: Pre-Immersion */}
        <div className="p-4 rounded-xl bg-light-grey/80 border border-forest/10 relative overflow-hidden">
          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-grey flex items-center justify-between">
            <span>Phase 01 · Baseline</span>
            <span className="w-2 h-2 rounded-full bg-forest"></span>
          </div>
          <div className="text-sm font-bold text-charcoal mt-1">Pre-Immersion</div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">Breach Severity:</span>
              <span className="font-mono font-bold text-charcoal">
                {baselineSeverity !== null ? `${(baselineSeverity * 100).toFixed(0)}%` : 'Not Sampled'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">Dissolved Oxygen:</span>
              <span className="font-mono font-bold text-forest">
                {latestPreDO !== null ? `${latestPreDO} mg/l` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">BOD (Organic):</span>
              <span className="font-mono font-bold text-charcoal">
                {latestPreBOD !== null ? `${latestPreBOD} mg/l` : '—'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-forest/10 text-[11px] text-muted-grey">
            {baselineSeverity !== null && baselineSeverity > 0.35
              ? 'Elevated baseline pollution prior to ritual activity.'
              : 'Relatively compliant pre-event water quality.'}
          </div>
        </div>

        {/* Phase 2: During Immersion */}
        <div className="p-4 rounded-xl bg-pale-green/40 border border-golden-yellow/40 relative overflow-hidden">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#8A6500] flex items-center justify-between">
            <span>Phase 02 · Peak Load</span>
            <span className="w-2 h-2 rounded-full bg-golden-yellow"></span>
          </div>
          <div className="text-sm font-bold text-charcoal mt-1">During Immersion</div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">Breach Severity:</span>
              <span className="font-mono font-bold text-charcoal">
                {duringSeverity !== null ? `${(duringSeverity * 100).toFixed(0)}%` : 'Not Sampled'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">Dissolved Oxygen:</span>
              <span className="font-mono font-bold text-forest">
                {latestDuringDO !== null ? `${latestDuringDO} mg/l` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">BOD (Organic):</span>
              <span className="font-mono font-bold text-charcoal">
                {latestDuringBOD !== null ? `${latestDuringBOD} mg/l` : '—'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-forest/10 text-[11px] font-mono text-[#8A6500] font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-risk-warning" />
            <span>
              Impact Delta:{' '}
              {severityDelta !== null ? `${severityDelta > 0 ? '+' : ''}${(severityDelta * 100).toFixed(0)}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Phase 3: Post-Immersion */}
        <div className="p-4 rounded-xl bg-light-grey/80 border border-forest/10 relative overflow-hidden">
          <div className="text-[10px] uppercase font-mono tracking-wider text-muted-grey flex items-center justify-between">
            <span>Phase 03 · Recovery</span>
            <span className="w-2 h-2 rounded-full bg-forest-light"></span>
          </div>
          <div className="text-sm font-bold text-charcoal mt-1">Post-Immersion (1 Wk)</div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">Breach Severity:</span>
              <span className="font-mono font-bold text-charcoal">
                {afterSeverity !== null ? `${(afterSeverity * 100).toFixed(0)}%` : 'Not Sampled'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">Recovery Delta:</span>
              <span className="font-mono font-bold text-charcoal">
                {recoveryDelta !== null ? `${recoveryDelta > 0 ? '+' : ''}${(recoveryDelta * 100).toFixed(0)}%` : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-grey">Return to Baseline:</span>
              <span className="font-mono font-semibold text-charcoal">
                {recoveryDelta !== null && recoveryDelta <= 0.05
                  ? 'Normalized'
                  : recoveryDelta !== null
                  ? 'Incomplete'
                  : 'No Evidence'}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-forest/10 text-[11px] text-muted-grey">
            {afterSeverity === null
              ? 'Post-immersion observation unavailable; recovery cannot be computed.'
              : recoveryDelta !== null && recoveryDelta <= 0.05
              ? 'Water parameters rebounded toward baseline within 7 days.'
              : 'Pollution residue remained elevated 7 days post-visarjan.'}
          </div>
        </div>
      </div>

      {/* Explicit Formula & Interpretation Note */}
      <div className="mt-6 p-4 rounded-xl bg-pale-green/30 border border-forest/15 space-y-2 text-xs text-charcoal">
        <div className="font-semibold text-forest flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-forest" />
          <span>Transparent Mathematical Calculations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-grey leading-relaxed">
          <div>
            <strong className="text-charcoal font-mono">Immersion Impact Formula:</strong>{' '}
            <code className="text-forest bg-white px-1.5 py-0.5 rounded border border-forest/10">
              During Severity − Pre Severity
            </code>
            <p className="mt-1 text-[11px]">
              A positive delta denotes worsening water condition during immersion due to idol dissolution and organic inputs.
            </p>
          </div>
          <div>
            <strong className="text-charcoal font-mono">Recovery Difference Formula:</strong>{' '}
            <code className="text-forest bg-white px-1.5 py-0.5 rounded border border-forest/10">
              Post Severity − Pre Severity
            </code>
            <p className="mt-1 text-[11px]">
              Values near 0 indicate return to pre-visarjan baseline. A positive difference indicates persistent residual pollution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
