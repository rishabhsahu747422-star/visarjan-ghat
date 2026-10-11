import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Waves,
  Activity,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import WaterRingLogo from '../components/ui/WaterRingLogo';
import ImpactQuadrant from '../components/charts/ImpactQuadrant';
import RankingsTable from '../components/tables/RankingsTable';
import ConfidenceBadge from '../components/ui/ConfidenceBadge';
import { useFestival } from '../context/FestivalContext';

export default function LandingPage() {
  const { festival, ghatsAnalysis, summary } = useFestival();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Historical Observation Harvest',
      desc: 'Ingests laboratory measurements directly from official Madhya Pradesh Pollution Control Board (MPPCB) reports across multiple years.',
      detail: 'Every reading the MPPCB reports publish for these ghats in 2023, 2024 and 2025, loaded and classified as measured, below detection or missing.'
    },
    {
      num: '02',
      title: 'Site & Phase Harmonization',
      desc: 'Standardizes disparate site nomenclatures and aligns each measurement strictly to Pre, During, or Post-immersion phases.',
      detail: 'Resolves complex multi-year naming variances (e.g. Kamla Park Kund vs Lower Lake Ghat) and tags match confidence.'
    },
    {
      num: '03',
      title: 'Three-Phase Baseline Separation',
      desc: 'Isolates chronic pre-event contamination from genuine immersion-induced water quality shocks.',
      detail: 'Separates water that was already past the limit from water that immersion made worse, by scoring the pre-immersion baseline on its own.'
    },
    {
      num: '04',
      title: 'Impact & Recovery Quantification',
      desc: 'Computes parameter deltas and post-immersion rebound rates only where both required phase observations exist.',
      detail: 'Nothing is extrapolated: a missing test stays missing rather than being read as clean water or as no impact.'
    },
    {
      num: '05',
      title: 'Audited Ranking & Data Gaps Disclosure',
      desc: 'Synthesizes transparent risk scores against CPCB Class B standards while openly flagging data gaps.',
      detail: 'Every single number is linked to its PDF report page, empowering municipal engineers with defensible civic evidence.'
    }
  ];

  return (
    <div className="min-h-screen bg-light-grey text-charcoal font-sans flex flex-col">
      <Navbar />

      {/* ========================================================
          HERO SECTION — "The Living Atlas"
          ======================================================== */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-carto-grid border-b border-forest/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Story */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Civic Tag & Location Annotation */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-forest/20 shadow-subtle text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-bright-yellow animate-pulse"></span>
                <span className="font-semibold text-forest">Bhopal, Madhya Pradesh</span>
                <span className="text-muted-grey">· Upper & Lower Lake Ecosystem</span>
              </div>

              {/* Main Cinematic Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal tracking-tight leading-[1.1] font-sans">
                Beyond Immersion.{' '}
                <span className="block font-editorial italic font-normal text-forest">
                  Understand the Impact.
                </span>
              </h1>

              {/* Supporting Editorial Copy */}
              <p className="text-base sm:text-lg text-charcoal/80 leading-relaxed max-w-2xl">
                A high pollution reading during idol immersion does not reveal whether the water was already degraded beforehand. <strong>Visarjan Ghat Watch</strong> examines multi-year water quality across baseline, immersion, and recovery phases—transforming dense PDF reports into clear, audited civic intelligence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/app"
                  className="px-6 py-3.5 rounded-xl bg-forest text-white font-semibold hover:bg-forest-deep transition-all duration-200 shadow-md hover:shadow-card inline-flex items-center gap-3 group"
                >
                  <span>Explore Water Intelligence</span>
                  <ArrowRight className="w-4 h-4 text-bright-yellow group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-xl bg-white text-charcoal border border-forest/20 font-semibold hover:bg-pale-green/40 hover:text-forest transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span>Understand Our Method</span>
                  <ChevronRight className="w-4 h-4 text-muted-grey" />
                </a>
              </div>

              {/* Golden numbers, read from /api/summary rather than typed in here */}
              <div className="pt-6 border-t border-forest/15 grid grid-cols-3 gap-4 font-mono text-xs text-muted-grey">
                <div>
                  <span className="block text-xl font-bold text-forest font-sans">
                    {summary ? summary.rows.toLocaleString() : '—'}
                  </span>
                  <span>Readings loaded</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-forest font-sans">
                    {summary ? `${summary.do_below_5} / ${summary.do_readings}` : '—'}
                  </span>
                  <span>DO readings below 5 mg/l</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-[#C06014] font-sans">
                    {summary ? `${summary.bod_above_3} / ${summary.bod_readings}` : '—'}
                  </span>
                  <span>BOD readings above 3 mg/l</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Photographic Composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-elevated border-2 border-white bg-white group">
                <img
                  src="/images/bhopal-hero.jpg"
                  alt="Upper Lake Bhojtal morning ghat in Bhopal"
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                {/* Fallback designed placeholder if image cannot load */}
                <div className="hidden w-full h-[400px] bg-forest-deep p-8 text-white relative">
                  <div className="absolute inset-0 bg-contour-pattern opacity-20"></div>
                  <WaterRingLogo size={64} className="text-bright-yellow mb-4" />
                  <h3 className="text-xl font-bold">Bhopal Lake Water Intelligence</h3>
                  <p className="text-xs text-white/70 mt-2">Historic stone ghats on Upper Lake Bhojtal.</p>
                </div>

                {/* Subtle Cartographic Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-forest/20 shadow-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-charcoal font-sans flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-forest" />
                      Upper Lake (Bhojtal)
                    </div>
                    <div className="text-[10px] text-muted-grey font-mono mt-0.5">
                      Ramsar Wetland Site · 361 sq km basin
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-1 rounded bg-pale-green text-forest font-semibold">
                    Class B Standard
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION C — PLATFORM INTRODUCTION: BEFORE / DURING / AFTER
          ======================================================== */}
      <section id="about" className="py-20 bg-white border-b border-forest/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-3 py-1 rounded-full bg-pale-green inline-block">
              Analytical Separation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight font-sans">
              Three Distinct Phases. Three Crucial Questions.
            </h2>
            <p className="text-base text-muted-grey leading-relaxed">
              Evaluating an immersion ghat without baseline context misdiagnoses urban runoff as festival impact. Visarjan Ghat Watch structures observations into three sequential windows:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
            {/* Visual connecting line for desktop */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-forest/20 z-0"></div>

            {/* Phase 1: Before */}
            <div className="relative z-10 bg-light-grey rounded-2xl p-7 border border-forest/15 shadow-subtle flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest text-white font-mono font-bold flex items-center justify-center text-base mb-5 shadow-sm">
                  01
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-forest font-bold">
                  Pre-Immersion
                </div>
                <h3 className="text-xl font-bold text-charcoal font-sans mt-1">
                  Establish the Baseline
                </h3>
                <p className="text-sm text-charcoal/70 mt-3 leading-relaxed">
                  Water quality varies a great deal before any ritual begins. Reading baseline DO, BOD and pH separates background inflows and runoff from what immersion itself changes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-forest/10 text-xs font-mono text-muted-grey">
                Key question: <em>Was the ghat already degraded before visarjan?</em>
              </div>
            </div>

            {/* Phase 2: During */}
            <div className="relative z-10 bg-pale-green/40 rounded-2xl p-7 border-2 border-golden-yellow/60 shadow-subtle flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-bright-yellow text-charcoal font-mono font-bold flex items-center justify-center text-base mb-5 shadow-sm">
                  02
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-[#916A00] font-bold">
                  Peak Immersion
                </div>
                <h3 className="text-xl font-bold text-charcoal font-sans mt-1">
                  Examine the Change
                </h3>
                <p className="text-sm text-charcoal/70 mt-3 leading-relaxed">
                  As thousands of idols enter the water, dissolved oxygen plunges while biochemical oxygen demand surges. Subtracting baseline from peak reveals the genuine impact delta attributable to the event.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-forest/10 text-xs font-mono text-[#916A00]">
                Key question: <em>How severely did the immersion shock the aquatic habitat?</em>
              </div>
            </div>

            {/* Phase 3: After */}
            <div className="relative z-10 bg-light-grey rounded-2xl p-7 border border-forest/15 shadow-subtle flex flex-col justify-between hover:shadow-card transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-light text-white font-mono font-bold flex items-center justify-center text-base mb-5 shadow-sm">
                  03
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-forest font-bold">
                  One Week After
                </div>
                <h3 className="text-xl font-bold text-charcoal font-sans mt-1">
                  Understand Recovery
                </h3>
                <p className="text-sm text-charcoal/70 mt-3 leading-relaxed">
                  Sampling one week post-immersion indicates whether natural circulation and aeration restored parameters back toward baseline—or whether organic debris caused protracted ecological stagnation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-forest/10 text-xs font-mono text-muted-grey">
                Key question: <em>Did the water body recover or stay in stagnation?</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION D — HOW THE PLATFORM WORKS (INTERACTIVE PROCESS)
          ======================================================== */}
      <section id="how-it-works" className="py-20 bg-light-grey border-b border-forest/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Explanatory Steps */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-3 py-1 rounded-full bg-pale-green inline-block">
                Analytical Journey
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight font-sans">
                How Visarjan Ghat Watch Analyzes the Data
              </h2>
              <p className="text-sm text-muted-grey leading-relaxed">
                Hover over any step of the analytical pipeline to inspect how raw laboratory tables become actionable municipal decisions:
              </p>

              {/* Step Navigation */}
              <div className="space-y-2.5 pt-4">
                {steps.map((st, idx) => (
                  <div
                    key={st.num}
                    onMouseEnter={() => setActiveStep(idx)}
                    onClick={() => setActiveStep(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                      activeStep === idx
                        ? 'bg-white border-forest shadow-card text-charcoal'
                        : 'bg-white/60 border-forest/10 text-charcoal/80 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded font-bold ${
                        activeStep === idx
                          ? 'bg-forest text-bright-yellow'
                          : 'bg-light-grey text-muted-grey'
                      }`}
                    >
                      {st.num}
                    </span>
                    <span className="text-sm font-semibold truncate">{st.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Step Detail Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-8 border border-forest/20 shadow-elevated relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pale-green rounded-bl-full -mr-8 -mt-8 opacity-60"></div>

                <div className="flex items-center gap-2 text-xs font-mono text-forest">
                  <span className="font-bold">PIPELINE STAGE {steps[activeStep].num}</span>
                  <span>· Living Atlas Methodology</span>
                </div>

                <h3 className="text-2xl font-bold text-charcoal font-sans mt-3">
                  {steps[activeStep].title}
                </h3>

                <p className="text-base text-charcoal/80 mt-4 leading-relaxed font-sans">
                  {steps[activeStep].desc}
                </p>

                <div className="mt-6 p-4 rounded-xl bg-pale-green/40 border border-forest/15">
                  <span className="text-xs font-mono uppercase tracking-wider text-forest font-bold block mb-1">
                    Implementation Rule
                  </span>
                  <p className="text-xs text-charcoal font-sans leading-relaxed">
                    {steps[activeStep].detail}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-forest/10 flex items-center justify-between text-xs text-muted-grey font-mono">
                  <span>Rule: Missing data is strictly unknown, never compliant.</span>
                  <Link
                    to="/app/methodology"
                    className="text-forest font-semibold hover:underline flex items-center gap-1"
                  >
                    View Complete Methodology <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION E — FEATURED ANALYTICAL PREVIEW (REAL CHARTS)
          ======================================================== */}
      <section className="py-20 bg-white border-b border-forest/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-forest/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-3 py-1 rounded-full bg-pale-green inline-block">
                Live Data Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight font-sans mt-2">
                Inside the Intelligence Workspace
              </h2>
              <p className="text-sm text-muted-grey mt-1">
                Computed by the API from the 2023 to 2025 MPPCB readings for {festival} immersion, against CPCB Class B limits.
              </p>
            </div>

            <Link
              to="/app"
              className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-deep transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
            >
              <span>Launch Full Workspace</span>
              <ExternalLink className="w-3.5 h-3.5 text-bright-yellow" />
            </Link>
          </div>

          {/* Interactive Matrix & Rankings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
            {/* Impact Quadrant Live Preview */}
            <div className="lg:col-span-7">
              <ImpactQuadrant ghats={ghatsAnalysis} />
            </div>

            {/* Priority Rankings Live Preview */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <RankingsTable
                ghats={ghatsAnalysis}
                isCompact={true}
                showSearch={false}
              />
              <div className="mt-4 p-4 rounded-xl bg-light-grey border border-forest/15 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-charcoal block">Explore All 8 Sites</span>
                  <span className="text-muted-grey text-[11px]">Includes unmonitored sites such as Arch Bridge</span>
                </div>
                <Link
                  to="/app/rankings"
                  className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-semibold hover:bg-forest-deep"
                >
                  View Rankings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION F — THE BHOPAL STORY (EDITORIAL & PHOTOGRAPHS)
          ======================================================== */}
      <section id="bhopal-story" className="py-20 bg-light-grey border-b border-forest/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-3 py-1 rounded-full bg-pale-green inline-block">
              Editorial Cartography
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight font-sans">
              The Lakes of Bhopal: Heritage & Ecological Stewardship
            </h2>
            <p className="text-base text-muted-grey leading-relaxed">
              Bhopal is inextricably bound to its historic lake system. Upper Lake (Bhojtal), established in the 11th century by Paramara King Raja Bhoj, provides over 30 million gallons of drinking water daily. Monitoring immersion ghats is not an indictment of faith—it is civic stewardship of life-giving water.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            {/* Story Card 1: Raja Bhoj */}
            <div className="bg-white rounded-2xl overflow-hidden border border-forest/15 shadow-subtle group hover:shadow-card transition-all">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/images/raja-bhoj.jpg"
                  alt="Raja Bhoj bronze statue in Upper Lake Bhopal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono text-forest font-bold">
                  Bhojtal Reservoir
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="font-bold text-lg text-charcoal font-sans">
                  The King Bhoj Heritage
                </h4>
                <p className="text-xs text-muted-grey leading-relaxed">
                  The monumental bronze statue of Raja Bhoj stands in Bhojtal, reminding the city that its water security has been engineered and protected for over a millennium.
                </p>
              </div>
            </div>

            {/* Story Card 2: Prempura Ghat & Monitoring */}
            <div className="bg-white rounded-2xl overflow-hidden border border-forest/15 shadow-subtle group hover:shadow-card transition-all">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/images/visarjan-ghat-1.jpg"
                  alt="Prempura Ghat with environmental monitoring apparatus"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono text-forest font-bold">
                  Prempura Ghat
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="font-bold text-lg text-charcoal font-sans">
                  Dedicated Immersion Ramps
                </h4>
                <p className="text-xs text-muted-grey leading-relaxed">
                  Designated visarjan spots like Prempura incorporate formal stone ramps and municipal crane infrastructure to restrict ecological exposure during peak religious gatherings.
                </p>
              </div>
            </div>

            {/* Story Card 3: Lower Lake Khatlapura */}
            <div className="bg-white rounded-2xl overflow-hidden border border-forest/15 shadow-subtle group hover:shadow-card transition-all">
              <div className="h-56 overflow-hidden relative">
                <img
                  src="/images/visarjan-ghat-2.jpg"
                  alt="Khatlapura Ghat on Lower Lake Bhopal with sampling boat"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono text-forest font-bold">
                  Lower Lake Ghats
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h4 className="font-bold text-lg text-charcoal font-sans">
                  Water Quality Sampling
                </h4>
                <p className="text-xs text-muted-grey leading-relaxed">
                  MPPCB environmental science boats conduct systematic pre, during, and post immersion testing, documenting chemical and physical recovery across the urban aquatic corridor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION G — TRUST & METHODOLOGY PRINCIPLES
          ======================================================== */}
      <section className="py-20 bg-white border-b border-forest/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-forest font-bold px-3 py-1 rounded-full bg-pale-green inline-block">
              Scientific Rigor
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight font-sans">
              Five Core Principles of Civic Trust
            </h2>
            <p className="text-sm text-muted-grey leading-relaxed">
              Why government officials, civic researchers, and citizens can depend on Visarjan Ghat Watch:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            <div className="p-6 rounded-2xl bg-light-grey border border-forest/15 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Missing is Unknown, Never Clean</span>
              </div>
              <p className="text-xs text-muted-grey leading-relaxed">
                If a test was not performed or an entire report table was omitted, the score does not assume 0 pollution. Missing observations trigger explicit data gap flags.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-light-grey border border-forest/15 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Transparent CPCB Class B Standards</span>
              </div>
              <p className="text-xs text-muted-grey leading-relaxed">
                All evaluations reflect legal CPCB outdoor bathing thresholds: DO ≥ 5.0 mg/l, BOD ≤ 3.0 mg/l, and pH 6.5–8.5. Parameters without limits are framed as context only.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-light-grey border border-forest/15 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Historical Analysis, Not Forecast</span>
              </div>
              <p className="text-xs text-muted-grey leading-relaxed">
                We report historical empirical performance from 2023–2025. We do not generate speculative predictive forecasts or claim statistical certainty on thin samples.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-light-grey border border-forest/15 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Confidence Visible with Conclusions</span>
              </div>
              <p className="text-xs text-muted-grey leading-relaxed">
                Every rank is paired with a High, Medium, or Low confidence badge explaining exactly which phases or multi-year continuity elements influenced the rating.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-light-grey border border-forest/15 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Festivals are Never Pooled</span>
              </div>
              <p className="text-xs text-muted-grey leading-relaxed">
                Durga Puja immersion (post-monsoon) and Ganesh Chaturthi (monsoon) occur under distinct meteorological and hydraulic conditions. Datasets are segregated.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-light-grey border border-forest/15 space-y-2">
              <div className="flex items-center gap-2 text-forest font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Zero Hallucinations or Health Claims</span>
              </div>
              <p className="text-xs text-muted-grey leading-relaxed">
                The product does not make unsupported medical safety conclusions. Every single metric traces directly to report PDF page citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION H — FINAL CALL TO ACTION
          ======================================================== */}
      <section className="py-20 bg-forest text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-contour-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <WaterRingLogo size={54} className="mx-auto text-bright-yellow" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans">
            Ready to Inspect the Evidence?
          </h2>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Enter the Visarjan Ghat Watch workspace to examine the Impact Quadrant, rank ghats against bathing standards, and generate official briefings.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app"
              className="px-8 py-4 rounded-xl bg-bright-yellow text-charcoal font-bold text-sm hover:bg-golden-yellow transition-all shadow-lg flex items-center gap-2"
            >
              <span>Open Living Atlas Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/app/methodology"
              className="px-6 py-4 rounded-xl bg-forest-deep text-white border border-white/20 font-semibold text-sm hover:bg-forest-deep/80 transition-all"
            >
              Review Methodology
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
