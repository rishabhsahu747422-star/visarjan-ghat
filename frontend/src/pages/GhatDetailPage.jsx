import React, { useState } from 'react';
import { useParams, Link, useOutletContext, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import WorkspaceHeader from '../components/layout/WorkspaceHeader';
import WaterQualityTrend from '../components/charts/WaterQualityTrend';
import ThreePhaseComparison from '../components/charts/ThreePhaseComparison';
import EvidenceTimeline from '../components/tables/EvidenceTimeline';
import ConfidenceBadge from '../components/ui/ConfidenceBadge';
import { useFestival } from '../context/FestivalContext';
import { getGhatDetail } from '../data/dataService';
import { getRiskLevelBadge } from '../utils/formatters';

export default function GhatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onOpenMobileMenu } = useOutletContext() || {};
  const { festival, ghatsAnalysis } = useFestival();

  // Find ghat by slug or default to first
  const currentSlug = id || 'khatlapura-ghat';
  const ghatDetail = getGhatDetail(currentSlug, festival);

  if (!ghatDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-charcoal">Ghat Not Found</h2>
        <p className="text-muted-grey mt-2">No observation profile matches identifier: {currentSlug}</p>
        <Link
          to="/app/rankings"
          className="mt-4 px-4 py-2 rounded-lg bg-forest text-white text-sm font-semibold"
        >
          Return to Ghat Rankings
        </Link>
      </div>
    );
  }

  const riskBadge = getRiskLevelBadge(ghatDetail.riskScore);

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <WorkspaceHeader
        title={ghatDetail.site}
        subtitle={`${ghatDetail.water_body} · ${festival} Visarjan Environmental Profile`}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 space-y-8">
        {/* Top Navigation & Ghat Quick Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/app/rankings"
            className="inline-flex items-center gap-2 text-xs font-semibold text-forest hover:text-forest-deep transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Rankings</span>
          </Link>

          {/* Quick Ghat Dropdown Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-grey font-mono">Switch Ghat:</span>
            <select
              value={ghatDetail.slug}
              onChange={(e) => navigate(`/app/ghat/${e.target.value}`)}
              className="px-3 py-1.5 rounded-xl bg-white border border-forest/15 text-xs font-semibold text-charcoal focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
            >
              {ghatsAnalysis.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.site} ({g.water_body})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ========================================================
            GHAT IDENTITY CARD
            ======================================================== */}
        <div className="bg-white rounded-2xl border border-forest/15 shadow-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-forest/10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-pale-green text-forest font-semibold border border-forest/20">
                  {ghatDetail.water_body}
                </span>

                {ghatDetail.rank !== null ? (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-forest text-white font-bold">
                    Rank {ghatDetail.rank} of {ghatsAnalysis.filter(g => g.rank !== null).length}
                  </span>
                ) : (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-light-grey text-muted-grey">
                    Unranked
                  </span>
                )}

                {ghatDetail.bmc_list_2026 === 'listed' && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-golden-yellow/20 text-charcoal font-semibold border border-golden-yellow/40">
                    BMC 2026 List
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal font-sans tracking-tight">
                {ghatDetail.site}
              </h2>

              <p className="text-sm text-charcoal/80 max-w-3xl leading-relaxed">
                {ghatDetail.description || 'Immersion site in Bhopal monitored under MPPCB idol immersion protocol.'}
              </p>
            </div>

            {/* Score & Confidence Badges */}
            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
              {ghatDetail.riskScore !== null ? (
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-grey">
                    Composite Risk Score
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-charcoal font-mono">
                      {ghatDetail.riskScore}
                    </span>
                    <span className="text-xs text-muted-grey font-mono">/ 100</span>
                  </div>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskBadge.bg}`}>
                    {riskBadge.label}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-light-grey border border-forest/15 text-xs text-muted-grey">
                  No Composite Score (Unsampled)
                </div>
              )}

              <ConfidenceBadge confidence={ghatDetail.confidence} />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-muted-grey block text-[10px]">Impact Quadrant:</span>
              <span className="font-bold text-forest text-sm font-sans">
                {ghatDetail.quadrant}
              </span>
            </div>
            <div>
              <span className="text-muted-grey block text-[10px]">Recorded Years:</span>
              <span className="font-bold text-charcoal text-sm">
                {ghatDetail.yearsWithData?.length > 0 ? ghatDetail.yearsWithData.join(', ') : 'None'}
              </span>
            </div>
            <div>
              <span className="text-muted-grey block text-[10px]">Total Measurements:</span>
              <span className="font-bold text-charcoal text-sm">
                {ghatDetail.totalReadings || 0} observations
              </span>
            </div>
            <div>
              <span className="text-muted-grey block text-[10px]">MPPCB Source Pages:</span>
              <span className="font-bold text-forest text-sm">
                {ghatDetail.sourcePages?.length > 0 ? `Pages ${ghatDetail.sourcePages.join(', ')}` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Missing Data Warning Banner (if applicable) */}
        {!ghatDetail.hasData ? (
          <div className="p-6 rounded-2xl bg-amber-50 border-2 border-golden-yellow/60 space-y-2 text-charcoal">
            <div className="flex items-center gap-2 font-bold text-sm text-[#8A6500]">
              <AlertTriangle className="w-5 h-5 text-risk-warning" />
              <span>Unmonitored Site: Pre-Immersion Baseline Testing Required</span>
            </div>
            <p className="text-xs text-muted-grey leading-relaxed">
              This site is listed in public BMC 2026 announcements but is completely absent from historical MPPCB water quality reports. In accordance with Visarjan Ghat Watch methodology, no risk score is fabricated. Municipal authorities must conduct mandatory baseline testing before authorizing public rituals.
            </p>
          </div>
        ) : ghatDetail.confidence.level === 'Low' || ghatDetail.confidence.level === 'Medium' ? (
          <div className="p-4 rounded-xl bg-pale-green/40 border border-forest/15 flex items-start gap-3 text-xs text-charcoal">
            <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-forest block">
                Data Limitations & Confidence Notes
              </span>
              <ul className="space-y-0.5 text-muted-grey">
                {ghatDetail.confidence.reasons.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {/* ========================================================
            A. WATER QUALITY HISTORICAL TRENDS (LINE CHARTS)
            ======================================================== */}
        {ghatDetail.hasData && (
          <WaterQualityTrend rawReadings={ghatDetail.rawReadings} />
        )}

        {/* ========================================================
            B & C. THREE-PHASE COMPARISON & DELTAS
            ======================================================== */}
        {ghatDetail.hasData && (
          <ThreePhaseComparison ghatDetail={ghatDetail} />
        )}

        {/* ========================================================
            D. EVIDENCE TIMELINE WITH REPORT SOURCE PAGES
            ======================================================== */}
        {ghatDetail.hasData && (
          <EvidenceTimeline readings={ghatDetail.rawReadings} />
        )}
      </div>
    </div>
  );
}
