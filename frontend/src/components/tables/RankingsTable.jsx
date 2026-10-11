import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import ConfidenceBadge from '../ui/ConfidenceBadge';
import { getRiskLevelBadge, formatDelta } from '../../utils/formatters';

export default function RankingsTable({
  ghats = [],
  isCompact = false,
  showSearch = true,
  className = '',
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const filteredAndSortedGhats = useMemo(() => {
    let result = [...ghats];

    // Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (g) =>
          g.site.toLowerCase().includes(q) ||
          (g.water_body && g.water_body.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nulls
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (sortField === 'confidence') {
        const order = { High: 3, Medium: 2, Low: 1, 'No Data': 0 };
        aVal = order[a.confidence?.level] || 0;
        bVal = order[b.confidence?.level] || 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return isCompact ? result.slice(0, 5) : result;
  }, [ghats, searchTerm, sortField, sortDirection, isCompact]);

  return (
    <div className={`bg-white rounded-2xl border border-forest/15 shadow-card overflow-hidden ${className}`}>
      {/* Search & Header bar */}
      {showSearch && (
        <div className="p-4 sm:p-5 border-b border-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-grey" />
            <input
              type="text"
              placeholder="Search ghat by name or lake..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-light-grey border border-forest/15 text-xs text-charcoal placeholder-muted-grey focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
            />
          </div>

          <div className="text-xs text-muted-grey font-mono flex items-center gap-2">
            <span>Showing {filteredAndSortedGhats.length} of {ghats.length} sites</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-light-grey/80 border-b border-forest/15 text-charcoal text-[11px] font-mono uppercase tracking-wider">
              <th
                onClick={() => handleSort('rank')}
                className="py-3 px-4 cursor-pointer hover:text-forest select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  <ArrowUpDown className="w-3 h-3 text-muted-grey" />
                </div>
              </th>
              <th
                onClick={() => handleSort('site')}
                className="py-3 px-4 cursor-pointer hover:text-forest select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Ghat & Water Body</span>
                  <ArrowUpDown className="w-3 h-3 text-muted-grey" />
                </div>
              </th>
              <th
                onClick={() => handleSort('baselineSeverity')}
                className="py-3 px-4 cursor-pointer hover:text-forest select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Baseline</span>
                  <ArrowUpDown className="w-3 h-3 text-muted-grey" />
                </div>
              </th>
              <th
                onClick={() => handleSort('severityDelta')}
                className="py-3 px-4 cursor-pointer hover:text-forest select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Immersion Impact</span>
                  <ArrowUpDown className="w-3 h-3 text-muted-grey" />
                </div>
              </th>
              <th
                onClick={() => handleSort('recoveryDelta')}
                className="py-3 px-4 cursor-pointer hover:text-forest select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Recovery (1 Wk)</span>
                  <ArrowUpDown className="w-3 h-3 text-muted-grey" />
                </div>
              </th>
              <th
                onClick={() => handleSort('riskScore')}
                className="py-3 px-4 cursor-pointer hover:text-forest select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3 text-muted-grey" />
                </div>
              </th>
              <th
                onClick={() => handleSort('confidence')}
                className="py-3 px-4 cursor-pointer hover:text-forest select-none"
              >
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3 text-muted-grey" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10 text-xs">
            {filteredAndSortedGhats.map((g) => {
              const riskBadge = getRiskLevelBadge(g.riskLevel);

              return (
                <tr
                  key={g.site}
                  onClick={() => navigate(`/app/ghat/${g.slug}`)}
                  className="hover:bg-pale-green/40 transition-colors cursor-pointer group"
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {g.rank !== null ? (
                      <span className="w-6 h-6 rounded-full bg-forest text-white inline-flex items-center justify-center text-xs">
                        {g.rank}
                      </span>
                    ) : (
                      <span className="text-muted-grey font-normal" title="Not ranked: no readings">—</span>
                    )}
                  </td>

                  {/* Ghat Name & Body */}
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-bold text-charcoal group-hover:text-forest transition-colors flex items-center gap-1.5">
                      <span>{g.site}</span>
                      {g.bmc_list_2026 === 'listed' && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pale-green text-forest border border-forest/20">
                          BMC 2026
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-grey mt-0.5 font-mono">
                      {g.water_body} · {g.quadrant} · latest data {g.latestYear}
                    </div>
                    <div className="text-[11px] text-charcoal/70 mt-1 font-sans max-w-md leading-snug">
                      {g.reason}
                    </div>
                  </td>

                  {/* Baseline Severity */}
                  <td className="py-3.5 px-4 font-mono">
                    {g.baselineSeverity !== null ? (
                      <span className="font-semibold text-charcoal">
                        {(g.baselineSeverity * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-grey">Not measured</span>
                    )}
                  </td>

                  {/* Immersion Delta */}
                  <td className="py-3.5 px-4 font-mono">
                    {g.severityDelta !== null ? (
                      <span
                        className={`font-semibold ${
                          g.severityDelta > 0 ? 'text-[#C06014]' : 'text-forest'
                        }`}
                      >
                        {g.severityDelta > 0 ? '+' : ''}
                        {(g.severityDelta * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-grey">Not measured at both stages</span>
                    )}
                  </td>

                  {/* Recovery: the wording, not just the delta. "No worse than before" is
                      not "clean" — a ghat can be no worse and still far above the limit (D-15). */}
                  <td className="py-3.5 px-4 font-mono">
                    {g.recoveryDelta !== null ? (
                      <span
                        className={`font-semibold ${
                          g.recoveryDelta > 0.05 ? 'text-[#C06014]' : 'text-forest'
                        }`}
                      >
                        {g.recoveryDelta > 0 ? '+' : ''}
                        {(g.recoveryDelta * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-muted-grey">Not measured at both stages</span>
                    )}
                    <span className="block text-[10px] text-muted-grey font-sans mt-0.5 leading-tight">
                      {g.recoveryText}
                    </span>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4 font-sans">
                    {g.riskScore !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-charcoal">
                          {g.riskScore}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${riskBadge.bg}`}
                        >
                          {riskBadge.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-grey text-[11px] italic">Not scored (untested)</span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-3.5 px-4">
                    <ConfidenceBadge confidence={g.confidence} />
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-forest group-hover:translate-x-1 inline-flex items-center transition-transform text-xs font-semibold">
                      Inspect <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footnote on missing data */}
      <div className="p-3 bg-light-grey/60 border-t border-forest/10 text-[11px] text-muted-grey flex items-center justify-between">
        <span>
          * Risk score computed by the API across pre, during and after readings, 2023 to 2025, weighted towards recent years. Sites with no readings are listed separately and never ranked.
        </span>
        <span className="font-mono text-forest">Click any row to open Ghat Explorer</span>
      </div>
    </div>
  );
}
