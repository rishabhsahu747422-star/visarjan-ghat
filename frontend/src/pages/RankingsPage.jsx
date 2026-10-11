import React, { useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  BarChart3,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ArrowUpDown,
  Download,
  Info
} from 'lucide-react';
import WorkspaceHeader from '../components/layout/WorkspaceHeader';
import RankingsTable from '../components/tables/RankingsTable';
import { useFestival } from '../context/FestivalContext';

export default function RankingsPage() {
  const { onOpenMobileMenu } = useOutletContext() || {};
  const { festival, ghatsAnalysis } = useFestival();
  const [selectedWaterBody, setSelectedWaterBody] = useState('All');

  const waterBodies = useMemo(() => {
    const bodies = new Set(ghatsAnalysis.map((g) => g.water_body).filter(Boolean));
    return ['All', ...Array.from(bodies)];
  }, [ghatsAnalysis]);

  const filteredGhats = useMemo(() => {
    if (selectedWaterBody === 'All') return ghatsAnalysis;
    return ghatsAnalysis.filter((g) => g.water_body === selectedWaterBody);
  }, [ghatsAnalysis, selectedWaterBody]);

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <WorkspaceHeader
        title="Ghat Risk Rankings"
        subtitle={`Comparative risk ranking of Bhopal immersion ghats for ${festival} Visarjan based on CPCB Class B standards.`}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {/* Methodological Context Callout */}
        <div className="p-4 rounded-2xl bg-white border border-forest/15 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pale-green text-forest">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-charcoal block">
                Rule-Based Ranking Principles
              </span>
              <span className="text-muted-grey">
                Rankings reflect multi-year breach severities against CPCB Class B bathing limits (DO ≥ 5 mg/l, BOD ≤ 3 mg/l, pH 6.5–8.5). Missing values are never scored as clean.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-[11px] text-muted-grey">
            <span className="px-2.5 py-1 rounded bg-light-grey border border-forest/15">
              During weight: 50%
            </span>
            <span className="px-2.5 py-1 rounded bg-light-grey border border-forest/15">
              Recovery: 30%
            </span>
            <span className="px-2.5 py-1 rounded bg-light-grey border border-forest/15">
              Baseline: 20%
            </span>
          </div>
        </div>

        {/* Water Body Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono uppercase text-muted-grey mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Body:
          </span>
          {waterBodies.map((body) => (
            <button
              key={body}
              onClick={() => setSelectedWaterBody(body)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedWaterBody === body
                  ? 'bg-forest text-white shadow-sm ring-1 ring-forest-deep'
                  : 'bg-white border border-forest/15 text-charcoal hover:bg-pale-green/40'
              }`}
            >
              {body === 'All' ? 'All Water Bodies' : body}
            </button>
          ))}
        </div>

        {/* Rankings Table Component */}
        <RankingsTable
          ghats={filteredGhats}
          isCompact={false}
          showSearch={true}
        />

        {/* Methodological Caveats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-grey pt-2">
          <div className="p-4 rounded-xl bg-white border border-forest/10 space-y-1">
            <span className="font-bold text-charcoal block flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-forest" />
              Handling Missing Observations
            </span>
            <p className="leading-relaxed">
              Sites with missing phases or unmonitored baseline records (such as Arch Bridge ghat) cannot receive an official risk score. They appear at the foot of the ranking with explicitly marked data gap reasons rather than forced or guessed numbers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-forest/10 space-y-1">
            <span className="font-bold text-charcoal block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              Auditable Source Pages
            </span>
            <p className="leading-relaxed">
              Each row links directly to that ghat's detail explorer where every laboratory value is paired with its original MPPCB report page citation for legal and municipal verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
