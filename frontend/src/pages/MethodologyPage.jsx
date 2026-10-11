import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import WorkspaceHeader from '../components/layout/WorkspaceHeader';
import CoverageHeatmap from '../components/charts/CoverageHeatmap';
import MissingDataRegister from '../components/tables/MissingDataRegister';
import { useFestival } from '../context/FestivalContext';
import { CPCB_LIMITS, CONTEXT_PARAMETERS } from '../data/ghatMeta';

export default function MethodologyPage() {
  const { onOpenMobileMenu } = useOutletContext() || {};
  const { festival } = useFestival();

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <WorkspaceHeader
        title="Data Gaps & Methodology"
        subtitle="Transparent documentation of environmental standards, scoring mathematics, coverage audits, and civic limitations."
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 space-y-10">
        {/* ========================================================
            1. CORE PARAMETERS & CPCB STANDARDS
            ======================================================== */}
        <div className="space-y-4">
          <div className="border-b border-forest/10 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-2.5 py-0.5 rounded bg-pale-green inline-block">
              Section 01
            </span>
            <h2 className="text-xl font-bold text-charcoal font-sans mt-2">
              Environmental Parameters & Legal Bathing Limits
            </h2>
            <p className="text-xs text-muted-grey mt-0.5">
              CPCB Class B criteria governing outdoor bathing waters, contrasted with contextual chemical indicators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dissolved Oxygen */}
            <div className="bg-white p-6 rounded-2xl border border-forest/15 shadow-subtle space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-forest uppercase">Dissolved Oxygen (DO)</span>
                <span className="px-2 py-0.5 rounded bg-pale-green text-forest font-bold">Min 5.0 mg/l</span>
              </div>
              <h3 className="text-base font-bold text-charcoal font-sans">
                Oxygen Available for Aquatic Life
              </h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                CPCB Class B expects at least 5.0 mg/l of dissolved oxygen for outdoor bathing water. During immersion, organic material from idols (flowers, wood, cloth) breaks down and draws oxygen out of the water.
              </p>
              <div className="pt-2 text-[11px] font-mono text-muted-grey border-t border-forest/10">
                Severity: <code>(5.0 − DO) / 5.0</code> when DO &lt; 5.0
              </div>
            </div>

            {/* BOD */}
            <div className="bg-white p-6 rounded-2xl border border-forest/15 shadow-subtle space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#C06014] uppercase">BOD (Biochemical Demand)</span>
                <span className="px-2 py-0.5 rounded bg-golden-yellow/20 text-charcoal font-bold">Max 3.0 mg/l</span>
              </div>
              <h3 className="text-base font-bold text-charcoal font-sans">
                Organic Waste Degradation Burden
              </h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                The oxygen bacteria need to break down organic material over three days. Class B bathing water is 3.0 mg/l or less. Readings at these ghats are often between 5 and 10 mg/l.
              </p>
              <div className="pt-2 text-[11px] font-mono text-muted-grey border-t border-forest/10">
                Severity: <code>(BOD − 3.0) / 3.0</code> when BOD &gt; 3.0
              </div>
            </div>

            {/* pH */}
            <div className="bg-white p-6 rounded-2xl border border-forest/15 shadow-subtle space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-forest uppercase">pH (Acidity / Alkalinity)</span>
                <span className="px-2 py-0.5 rounded bg-pale-green text-forest font-bold">6.5 to 8.5</span>
              </div>
              <h3 className="text-base font-bold text-charcoal font-sans">
                Hydrogen Ion Concentration
              </h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                Pure water is neutral at 7.0. CPCB Class B permits values between 6.5 and 8.5. Plaster of Paris (gypsum) and chemical paint binders can shift surface lake pH away from equilibrium.
              </p>
              <div className="pt-2 text-[11px] font-mono text-muted-grey border-t border-forest/10">
                Severity: Distance outside [6.5, 8.5] per 1.0 unit
              </div>
            </div>
          </div>

          {/* Contextual Parameters Note */}
          <div className="p-4 rounded-xl bg-white border border-forest/10 text-xs text-muted-grey flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-charcoal">Contextual Parameters without Class B Legal Limits:</strong>{' '}
              {CONTEXT_PARAMETERS.join(', ')}. While heavy metals (Lead, Chromium, Zinc) and Turbidity are tested and reported in MPPCB tables, CPCB Class B does not define numeric outdoor bathing limits for them. Hence they are treated as environmental context rather than legal bathing breach scores.
            </p>
          </div>
        </div>

        {/* ========================================================
            2. SCORING & MATHEMATICAL FORMULATION
            ======================================================== */}
        <div className="space-y-4">
          <div className="border-b border-forest/10 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-2.5 py-0.5 rounded bg-pale-green inline-block">
              Section 02
            </span>
            <h2 className="text-xl font-bold text-charcoal font-sans mt-2">
              Mathematical Scoring Pipeline
            </h2>
            <p className="text-xs text-muted-grey mt-0.5">
              Deterministic formulation separating baseline degradation from immersion impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Phase Severities */}
            <div className="bg-white p-6 rounded-2xl border border-forest/15 shadow-subtle space-y-3 text-xs leading-relaxed">
              <h3 className="font-bold text-sm text-charcoal font-sans flex items-center gap-2">
                <span className="font-mono text-xs bg-forest text-white px-2 py-0.5 rounded">A</span>
                Phase Severity & Weighting
              </h3>
              <p className="text-muted-grey">
                For each observation phase (<code className="text-forest">pre</code>, <code className="text-forest">during</code>, <code className="text-forest">after</code>), phase breach severity is the arithmetic mean across measured Class B parameters (DO, BOD, pH). A phase with zero measured readings is marked as unknown (<code className="text-muted-grey">null</code>), never zero.
              </p>
              <div className="p-3 bg-light-grey rounded-xl font-mono text-[11px] text-charcoal space-y-1">
                <div>Phase Weights: During (50%), After (30%), Pre (20%)</div>
                <div>Recency Weights: 2025 (50%), 2024 (30%), 2023 (20%)</div>
              </div>
            </div>

            {/* Box 2: Impact & Recovery Deltas */}
            <div className="bg-white p-6 rounded-2xl border border-forest/15 shadow-subtle space-y-3 text-xs leading-relaxed">
              <h3 className="font-bold text-sm text-charcoal font-sans flex items-center gap-2">
                <span className="font-mono text-xs bg-golden-yellow text-charcoal px-2 py-0.5 rounded">B</span>
                Impact & Recovery Formulas
              </h3>
              <p className="text-muted-grey">
                Deltas are computed strictly when both paired observations exist in the same reporting cycle:
              </p>
              <div className="p-3 bg-light-grey rounded-xl font-mono text-[11px] text-charcoal space-y-1">
                <div>Immersion Impact = During Severity − Pre Severity</div>
                <div>Immersion Damage (Y) = max(0, During − Pre Severity)</div>
                <div>Recovery Difference = Post Severity − Pre Severity</div>
              </div>
              <p className="text-[11px] text-muted-grey">
                Recovery difference is not an arbitrary percentage; values approaching zero indicate return toward baseline conditions.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. OBSERVATION COVERAGE MATRIX (HEATMAP)
            ======================================================== */}
        <div className="space-y-4">
          <div className="border-b border-forest/10 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-2.5 py-0.5 rounded bg-pale-green inline-block">
              Section 03
            </span>
            <h2 className="text-xl font-bold text-charcoal font-sans mt-2">
              Laboratory Coverage Matrix
            </h2>
            <p className="text-xs text-muted-grey mt-0.5">
              Comprehensive audit across ghats, parameters, and phases for the 2025 {festival} testing pack.
            </p>
          </div>

          <CoverageHeatmap />
        </div>

        {/* ========================================================
            4. MISSING DATA REGISTER & AUDIT
            ======================================================== */}
        <div className="space-y-4">
          <div className="border-b border-forest/10 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-2.5 py-0.5 rounded bg-pale-green inline-block">
              Section 04
            </span>
            <h2 className="text-xl font-bold text-charcoal font-sans mt-2">
              Missing-Data Register & Interpretive Impact
            </h2>
            <p className="text-xs text-muted-grey mt-0.5">
              Full accounting of missing tables, nomenclature discrepancies, and unmonitored sites.
            </p>
          </div>

          <MissingDataRegister />
        </div>

        {/* ========================================================
            5. CONFIDENCE FRAMEWORK & LIMITATIONS DECLARATION
            ======================================================== */}
        <div className="bg-white rounded-2xl border border-forest/15 shadow-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-forest/10 pb-4">
            <h3 className="text-lg font-bold text-charcoal font-sans flex items-center gap-2">
              Confidence Framework & Civic Trust Declaration
              <span className="w-2 h-2 rounded-full bg-bright-yellow"></span>
            </h3>
            <p className="text-xs text-muted-grey mt-1">
              How confidence levels are mathematically assigned and transparently declared.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-pale-green/40 border border-forest/20 space-y-2">
              <span className="font-bold text-forest block uppercase font-mono">High Confidence</span>
              <p className="text-muted-grey leading-relaxed">
                Assigned when core parameters (DO, BOD, pH) have complete observations across pre, during, and after phases for the latest two consecutive years, with unambiguous site location matching.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-golden-yellow/20 border border-golden-yellow/40 space-y-2">
              <span className="font-bold text-[#8A6500] block uppercase font-mono">Medium Confidence</span>
              <p className="text-muted-grey leading-relaxed">
                Assigned when minor phases are omitted, or when sampling nomenclature varies across reports (e.g. Rani Kamlapati ghat vs Kamla Park kund).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-risk-warning/15 border border-risk-warning/30 space-y-2">
              <span className="font-bold text-risk-warning block uppercase font-mono">Low / No Data</span>
              <p className="text-muted-grey leading-relaxed">
                Assigned when the entire latest year table is absent from the published report (e.g. Bairagarh Durga 2025), or when a site has never been sampled (Arch Bridge ghat).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-forest/10 text-xs text-muted-grey leading-relaxed space-y-2">
            <p>
              <strong>Non-Goals & Honest Limitations:</strong> Visarjan Ghat Watch does not issue medical health warnings, nor does it simulate hydrodynamic plume dispersion or generate predictive forecasts for future dates. All rankings reflect historical observations compiled from official Madhya Pradesh Pollution Control Board records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
