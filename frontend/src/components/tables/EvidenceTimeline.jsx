import React, { useState } from 'react';
import { FileText, Calendar, Filter, ExternalLink } from 'lucide-react';
import { formatPhase, formatValueWithUnit } from '../../utils/formatters';

export default function EvidenceTimeline({ readings = [], className = '' }) {
  const [yearFilter, setYearFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');

  const years = ['All', '2025', '2024', '2023'];
  const phases = ['All', 'pre', 'during', 'after'];

  const filteredReadings = readings.filter((r) => {
    if (yearFilter !== 'All' && String(r.year) !== yearFilter) return false;
    if (phaseFilter !== 'All' && r.phase !== phaseFilter) return false;
    return true;
  });

  return (
    <div className={`bg-white rounded-2xl border border-forest/15 shadow-card p-6 ${className}`}>
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <h3 className="font-bold text-base text-charcoal font-sans flex items-center gap-2">
            Observation Evidence Log & Traceability
            <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
          </h3>
          <p className="text-xs text-muted-grey mt-0.5">
            Every reading with the limit it is compared against and the report page it came from. The reports print no units; the standard unit for each test is assumed (see Methodology).
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-light-grey border border-forest/15 text-xs text-charcoal font-mono focus:outline-none focus:ring-1 focus:ring-forest"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === 'All' ? 'All Years' : `Year ${y}`}
              </option>
            ))}
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-light-grey border border-forest/15 text-xs text-charcoal font-mono focus:outline-none focus:ring-1 focus:ring-forest"
          >
            {phases.map((p) => (
              <option key={p} value={p}>
                {p === 'All' ? 'All Phases' : `Phase: ${p.toUpperCase()}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Observations Table */}
      <div className="mt-4 overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-light-grey border-b border-forest/20 text-charcoal font-mono text-[11px] uppercase">
            <tr>
              <th className="py-2.5 px-3">Year / Phase</th>
              <th className="py-2.5 px-3">Parameter</th>
              <th className="py-2.5 px-3">Observed Value</th>
              <th className="py-2.5 px-3">Class B Limit</th>
              <th className="py-2.5 px-3">Against Limit</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">As Printed</th>
              <th className="py-2.5 px-3 text-right">MPPCB Source Page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10 font-sans">
            {filteredReadings.map((r, index) => {
              const isMissing = r.status === 'missing';
              const isBDL = r.status === 'below_detection';

              return (
                <tr key={index} className="hover:bg-pale-green/20 transition-colors">
                  <td className="py-2 px-3 font-mono">
                    <span className="font-bold text-charcoal">{r.year}</span> ·{' '}
                    <span className="uppercase text-forest font-semibold">{r.phase}</span>
                  </td>
                  <td className="py-2 px-3 font-medium text-charcoal">
                    {r.parameter}
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold">
                    {r.status === 'measured' ? (
                      <span className="text-forest">{r.value}</span>
                    ) : (
                      // Never a 0 and never a blank: say which kind of gap this is.
                      <span className="text-muted-grey italic">
                        {formatValueWithUnit(r.value, '', r.status)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-muted-grey">
                    {r.limit || <span title="No CPCB Class B limit for this parameter">context only</span>}
                  </td>
                  <td className="py-2 px-3 text-[11px]">
                    {r.limit === null || r.breach === null ? (
                      <span className="text-muted-grey">—</span>
                    ) : r.breach > 0 ? (
                      <span className="text-risk-critical font-semibold">Past limit</span>
                    ) : (
                      <span className="text-forest">Within limit</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {r.status === 'measured' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-pale-green text-forest font-semibold">
                        Measured
                      </span>
                    )}
                    {isBDL && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-golden-yellow/20 text-charcoal font-semibold">
                        Below detection
                      </span>
                    )}
                    {isMissing && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-light-grey text-muted-grey border border-forest/10">
                        Not measured
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-muted-grey text-[11px]">
                    {r.value_as_printed || '—'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-forest">
                    {r.source_page ? (
                      <span className="inline-flex items-center gap-1 bg-pale-green px-2 py-0.5 rounded text-[11px] font-semibold">
                        <FileText className="w-3 h-3" /> Page {r.source_page}
                      </span>
                    ) : (
                      <span className="text-muted-grey">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-forest/10 flex items-center justify-between text-xs text-muted-grey">
        <span>Showing {filteredReadings.length} readings.</span>
        <span className="font-mono text-forest">Source: MPPCB immersion reports 2023 to 2025</span>
      </div>
    </div>
  );
}
