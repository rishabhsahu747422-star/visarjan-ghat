import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Compass,
  AlertTriangle,
  Waves,
  ArrowRight,
  TrendingDown,
  Info,
  Layers,
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import WorkspaceHeader from '../components/layout/WorkspaceHeader';
import ImpactQuadrant from '../components/charts/ImpactQuadrant';
import RankingsTable from '../components/tables/RankingsTable';
import { useFestival } from '../context/FestivalContext';

export default function OverviewPage() {
  const { onOpenMobileMenu } = useOutletContext() || {};
  const { festival, ghatsAnalysis, noDataGhats, summary, loading, error } = useFestival();

  // Counts over what the API returned. Nothing here recomputes a score.
  const plottableGhats = ghatsAnalysis.filter(
    (g) => g.baselineSeverity !== null && g.immersionDamage !== null
  );
  const elevatedImpactGhats = ghatsAnalysis.filter(
    (g) => g.immersionDamage !== null && g.immersionDamage >= 0.15
  );
  const incompleteRecoveryGhats = ghatsAnalysis.filter(
    (g) => g.recoveryDelta === null || g.recoveryDelta > 0.05
  );
  const unmonitoredGhats = noDataGhats;
  const allSites = ghatsAnalysis.length + noDataGhats.length;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="p-4 rounded-xl bg-white border-l-4 border-risk-warning text-sm text-charcoal max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-sm text-muted-grey" aria-busy="true">
        Loading the readings...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <WorkspaceHeader
        title="Environmental Overview"
        subtitle={`Past water-quality readings before, during and a week after ${festival} immersion at Bhopal's ghats, 2023 to 2025.`}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* ========================================================
            A. SUMMARY METRICS — Meaningful & Dataset Grounded
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Ghats Cataloged */}
          <div className="bg-white p-5 rounded-2xl border border-forest/15 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-grey text-xs font-mono">
                <span>CATALOGED GHATS</span>
                <span className="w-2 h-2 rounded-full bg-forest"></span>
              </div>
              <div className="text-3xl font-extrabold text-charcoal font-sans mt-2">
                {allSites} Sites
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-forest/10 text-xs text-muted-grey">
              {ghatsAnalysis.length} with MPPCB readings, {noDataGhats.length} with none
              {noDataGhats.length > 0 && ` (${noDataGhats.map((g) => g.site).join(', ')})`}.
              A site with no readings is untested, not clean.
            </div>
          </div>

          {/* Card 2: Sufficient Paired Observations */}
          <div className="bg-white p-5 rounded-2xl border border-forest/15 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-muted-grey text-xs font-mono">
                <span>COMPARISON COVERAGE</span>
                <span className="w-2 h-2 rounded-full bg-bright-yellow"></span>
              </div>
              <div className="text-3xl font-extrabold text-charcoal font-sans mt-2">
                {plottableGhats.length} / {ghatsAnalysis.length}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-forest/10 text-xs text-muted-grey">
              Ghats with matched baseline & during observations.
            </div>
          </div>

          {/* Card 3: Elevated Observed Immersion Impact */}
          <div className="bg-white p-5 rounded-2xl border border-golden-yellow/40 bg-pale-green/20 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#8A6500] text-xs font-mono">
                <span>ELEVATED IMPACT</span>
                <span className="w-2 h-2 rounded-full bg-golden-yellow"></span>
              </div>
              <div className="text-3xl font-extrabold text-[#755500] font-sans mt-2">
                {elevatedImpactGhats.length} Ghats
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-forest/10 text-xs text-muted-grey">
              Observed ≥15% severity spike during immersion phase.
            </div>
          </div>

          {/* Card 4: Incomplete Recovery / Gaps */}
          <div className="bg-white p-5 rounded-2xl border border-risk-warning/30 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-risk-warning text-xs font-mono">
                <span>RECOVERY GAPS</span>
                <span className="w-2 h-2 rounded-full bg-risk-warning"></span>
              </div>
              <div className="text-3xl font-extrabold text-risk-warning font-sans mt-2">
                {incompleteRecoveryGhats.length} Sites
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-forest/10 text-xs text-muted-grey">
              Residual organic loading after 1 week or missing data.
            </div>
          </div>
        </div>

        {/* Golden Dataset Summary Banner */}
        <div className="p-4 rounded-2xl bg-white border border-forest/15 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
            <span className="text-charcoal">
              <strong>Audit baseline:</strong> {summary.rows.toLocaleString()} readings loaded from the 2023, 2024 and 2025 MPPCB reports.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-grey">
            <span>
              DO &lt; 5 mg/l:{' '}
              <strong className="text-forest">{summary.do_below_5} of {summary.do_readings}</strong>
            </span>
            <span>·</span>
            <span>
              BOD &gt; 3 mg/l:{' '}
              <strong className="text-[#C06014]">{summary.bod_above_3} of {summary.bod_readings}</strong>
            </span>
            <span>·</span>
            <span className="text-forest font-semibold">CPCB Class B Standard</span>
          </div>
        </div>

        {/* ========================================================
            B. MAIN SIGNATURE VISUALIZATION — THE IMPACT QUADRANT
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal font-sans flex items-center gap-2">
                Signature Matrix: Baseline vs. Immersion Impact
              </h2>
              <p className="text-xs text-muted-grey">
                Click any ghat marker on the canvas to inspect historical trends and source pages.
              </p>
            </div>
            <Link
              to="/app/rankings"
              className="text-xs font-semibold text-forest hover:text-forest-deep flex items-center gap-1"
            >
              View Full Rankings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ImpactQuadrant ghats={ghatsAnalysis} />
        </div>

        {/* ========================================================
            C. PRIORITY RANKINGS PREVIEW & EVIDENCE SUMMARY
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Top 5 Priority Ranking Table */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal font-sans">
                  Observed Priority Ranking Preview
                </h3>
                <p className="text-xs text-muted-grey">
                  Synthesized multi-year risk score based on breach severity against CPCB Class B bathing limits.
                </p>
              </div>

              <Link
                to="/app/rankings"
                className="px-3 py-1.5 rounded-lg bg-light-grey hover:bg-pale-green text-forest border border-forest/20 text-xs font-semibold transition-colors"
              >
                Inspect all {allSites} sites
              </Link>
            </div>

            <RankingsTable
              ghats={ghatsAnalysis}
              isCompact={true}
              showSearch={false}
            />
          </div>

          {/* Right Column: Recent Derived Notes & Completeness */}
          <div className="lg:col-span-4 space-y-6">
            {/* Derived Notes Card */}
            <div className="bg-white p-5 rounded-2xl border border-forest/15 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <h4 className="font-bold text-sm text-charcoal font-sans flex items-center gap-2">
                  Key Evidence Findings
                  <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pale-green text-forest">
                  {festival}
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-charcoal/80">
                <div className="p-3 rounded-xl bg-light-grey/80 border border-forest/10 space-y-1">
                  <div className="font-bold text-forest flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-forest text-white px-1.5 py-0.2 rounded">01</span>
                    <span>DO below the limit before immersion</span>
                  </div>
                  <p className="text-muted-grey text-[11px]">
                    Khatlapura and Bairagarh exhibit severe pre-visarjan baseline oxygen deficit, proving that lake degradation begins prior to religious assemblies.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-pale-green/40 border border-golden-yellow/40 space-y-1">
                  <div className="font-bold text-[#8A6500] flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-golden-yellow text-charcoal px-1.5 py-0.2 rounded">02</span>
                    <span>Immersion Shock Dissolution</span>
                  </div>
                  <p className="text-muted-grey text-[11px]">
                    Prempura and Malikhedi show pronounced peak organic spikes during immersion, with DO falling markedly across comparable rows.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-light-grey/80 border border-forest/10 space-y-1">
                  <div className="font-bold text-risk-warning flex items-center gap-1">
                    <span className="text-[10px] font-mono bg-risk-warning text-white px-1.5 py-0.2 rounded">03</span>
                    <span>Unmonitored Active Sites</span>
                  </div>
                  <p className="text-muted-grey text-[11px]">
                    Arch Bridge ghat is announced in BMC 2026 public news reports but contains zero MPPCB historical records. Requires pre-event testing.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Official Brief Link */}
            <div className="bg-forest text-white p-5 rounded-2xl border border-forest-deep shadow-card space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none"></div>
              <div className="text-xs font-mono uppercase text-bright-yellow font-bold tracking-wider">
                Civic Briefing
              </div>
              <h4 className="text-base font-bold font-sans">
                Generate Official Briefing for BMC
              </h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Produce a structured one-pager in English or Hindi with traceable PDF citations, ready for printing or forwarding.
              </p>
              <Link
                to="/app/brief"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bright-yellow text-charcoal text-xs font-bold hover:bg-golden-yellow transition-all"
              >
                <span>Open Official Brief</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
