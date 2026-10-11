import React, { useEffect, useState } from 'react';
import { fetchCoverageMatrix } from '../../data/dataService';
import { useFestival } from '../../context/FestivalContext';
import { HelpCircle, Check, X, Minus } from 'lucide-react';

export default function CoverageHeatmap({ className = '' }) {
  const { festival, ghatsAnalysis } = useFestival();
  const [activeCell, setActiveCell] = useState(null);
  const [coverageData, setCoverageData] = useState(null);

  // Built from /api/ghat for each ranked ghat, so an empty cell is an empty cell in the
  // report. Nothing here fills a gap with a zero.
  useEffect(() => {
    let cancelled = false;
    setCoverageData(null);
    if (ghatsAnalysis.length === 0) return undefined;
    fetchCoverageMatrix(ghatsAnalysis, festival)
      .then((m) => !cancelled && setCoverageData(m))
      .catch(() => !cancelled && setCoverageData(null));
    return () => {
      cancelled = true;
    };
  }, [ghatsAnalysis, festival]);

  if (!coverageData) {
    return (
      <div className={`bg-white rounded-2xl border border-forest/15 shadow-card p-6 text-sm text-muted-grey ${className}`} aria-busy="true">
        Loading the coverage matrix...
      </div>
    );
  }

  const { parameters, phases, matrix, year } = coverageData;

  return (
    <div className={`bg-white rounded-2xl border border-forest/15 shadow-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <h3 className="font-bold text-base text-charcoal font-sans flex items-center gap-2">
            Observation coverage ({year} {festival} report)
            <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
          </h3>
          <p className="text-xs text-muted-grey mt-0.5">
            Audit of measured vs. missing parameters across immersion phases. Missing values are never treated as clean.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-forest text-white text-[9px] flex items-center justify-center font-bold">✓</span>
            <span className="text-charcoal">Measured</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-golden-yellow text-charcoal text-[9px] flex items-center justify-center font-bold">~</span>
            <span className="text-charcoal">BDL (Low)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-light-grey border border-forest/20 text-muted-grey text-[9px] flex items-center justify-center font-bold">✕</span>
            <span className="text-muted-grey">Not Sampled</span>
          </div>
        </div>
      </div>

      {/* Heatmap / Matrix Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2.5 text-left font-bold text-charcoal bg-light-grey rounded-tl-lg border-b border-forest/20 min-w-[180px]">
                Ghat Name
              </th>
              {parameters.map((param) => (
                <th
                  key={param}
                  colSpan={phases.length}
                  className="p-2 text-center font-semibold text-charcoal bg-light-grey border-b border-l border-forest/20 min-w-[110px]"
                >
                  <div className="truncate max-w-[120px] mx-auto" title={param}>
                    {param === 'Dissolved oxygen' ? 'DO' : param}
                  </div>
                  <div className="grid grid-cols-3 text-[9px] font-mono text-muted-grey font-normal mt-1 border-t border-forest/10 pt-1">
                    <span>Pre</span>
                    <span>Dur</span>
                    <span>Aft</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {matrix.map((row) => (
              <tr key={row.site} className="hover:bg-pale-green/20 transition-colors">
                <td className="p-2.5 font-medium text-charcoal font-sans text-xs">
                  <div className="font-semibold text-charcoal">{row.site}</div>
                </td>

                {parameters.map((param) => {
                  const paramCells = row.cells[param] || {};
                  return (
                    <React.Fragment key={`${row.site}-${param}`}>
                      {phases.map((ph) => {
                        const cell = paramCells[ph] || { status: 'missing', label: 'Not sampled' };
                        let bg = 'bg-light-grey/60 text-muted-grey';
                        let symbol = '—';

                        if (cell.status === 'measured') {
                          bg = 'bg-forest/15 text-forest font-semibold border-forest/30';
                          symbol = '✓';
                        } else if (cell.status === 'below_detection') {
                          bg = 'bg-golden-yellow/25 text-[#735700] font-semibold border-golden-yellow/40';
                          symbol = 'BDL';
                        }

                        return (
                          <td
                            key={`${row.site}-${param}-${ph}`}
                            className="p-1 border-l border-forest/10 text-center"
                          >
                            <div
                              className={`w-full py-1.5 px-0.5 rounded text-[10px] font-mono transition-transform hover:scale-105 cursor-pointer flex items-center justify-center ${bg}`}
                              title={`${row.site} · ${param} (${ph.toUpperCase()}): ${cell.label}`}
                              onClick={() =>
                                setActiveCell({
                                  site: row.site,
                                  param,
                                  phase: ph,
                                  details: cell,
                                })
                              }
                            >
                              {symbol}
                            </div>
                          </td>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Detail Modal / Inspector */}
      {activeCell && (
        <div className="mt-4 p-3.5 rounded-xl bg-pale-green/50 border border-forest/20 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-forest">{activeCell.site}</span>
            <div className="text-muted-grey">
              Parameter: <strong className="text-charcoal">{activeCell.param}</strong> · Phase:{' '}
              <strong className="text-charcoal uppercase">{activeCell.phase}</strong> · Status:{' '}
              <span className="font-mono text-forest font-semibold">{activeCell.details.label}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveCell(null)}
            className="text-xs px-2.5 py-1 rounded-md bg-forest text-white hover:bg-forest-deep"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Audit Footnote */}
      <div className="mt-4 pt-3 border-t border-forest/10 text-xs text-muted-grey">
        <strong>Coverage Principle:</strong> MPPCB reports publish raw laboratory measurements. Blank entries, dashes, and untabulated sites indicate gaps in testing frequency, never clean water.
      </div>
    </div>
  );
}
