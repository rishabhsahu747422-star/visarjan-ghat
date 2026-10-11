import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Printer,
  Copy,
  Check,
  RefreshCw,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Download
} from 'lucide-react';
import WorkspaceHeader from '../components/layout/WorkspaceHeader';
import WaterRingLogo from '../components/ui/WaterRingLogo';
import { useFestival } from '../context/FestivalContext';
import { generateOfficialBrief } from '../utils/briefGenerator';

export default function OfficialBriefPage() {
  const { onOpenMobileMenu } = useOutletContext() || {};
  const { festival, ghatsAnalysis, summary } = useFestival();
  const [lang, setLang] = useState('en'); // 'en' or 'hi'
  const [copied, setCopied] = useState(false);
  const [lastRegenerated, setLastRegenerated] = useState(new Date().toLocaleTimeString());

  const brief = generateOfficialBrief(festival, ghatsAnalysis, summary);
  const activeContent = lang === 'en' ? brief.english : brief.hindi;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const textToCopy = `
${activeContent.title}
${activeContent.subtitle}
----------------------------------------
Jurisdiction: ${activeContent.metadata.jurisdiction}
Target: ${activeContent.metadata.targetFestival}
Standard: ${activeContent.metadata.standard}
Period: ${activeContent.metadata.datasetPeriod}

EXECUTIVE SUMMARY:
${activeContent.executiveSummary}

PRIORITY SITES:
${activeContent.priorityGhats.map((g) => `• Rank ${g.rank}: ${g.site} (${g.waterBody}) — Risk Score ${g.riskScore}/100 [${g.confidence} Confidence]. ${g.findings}`).join('\n')}

KEY OBSERVATIONS:
${activeContent.keyObservations.map((o) => `• ${o}`).join('\n')}

DATA CONFIDENCE & LIMITATIONS:
${activeContent.dataConfidenceAndLimitations.map((l) => `• ${l}`).join('\n')}

${activeContent.statutoryNotes}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleRegenerate = () => {
    setLastRegenerated(new Date().toLocaleTimeString());
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <div className="no-print">
        <WorkspaceHeader
          title="Official Analytical Brief"
          subtitle={`Structured briefing document for municipal planning and environmental oversight during ${festival} Visarjan.`}
          onOpenMobileMenu={onOpenMobileMenu}
        />
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Action Controls Bar (Hidden during Print) */}
        <div className="no-print p-4 rounded-2xl bg-white border border-forest/15 shadow-subtle flex flex-wrap items-center justify-between gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-forest" />
            <div
              className="inline-flex p-1 bg-light-grey rounded-xl border border-forest/15"
              role="group"
            >
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  lang === 'en'
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-charcoal hover:bg-white/60'
                }`}
              >
                English Brief
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  lang === 'hi'
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-charcoal hover:bg-white/60'
                }`}
              >
                हिंदी विवरण (Hindi)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              className="px-3.5 py-2 rounded-xl bg-light-grey hover:bg-pale-green border border-forest/20 text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors"
              title="Re-compute and refresh summary from active dataset"
            >
              <RefreshCw className="w-3.5 h-3.5 text-forest" />
              <span>Regenerate ({lastRegenerated})</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-light-grey hover:bg-pale-green border border-forest/20 text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-forest" />
                  <span className="text-forest font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-forest" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-bright-yellow" />
              <span>Print Brief (PDF)</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            OFFICIAL DOCUMENT SHEET (PRINT-OPTIMIZED)
            ======================================================== */}
        <div className="print-document bg-white rounded-2xl border-2 border-forest/20 shadow-elevated p-8 sm:p-12 space-y-8 font-sans">
          {/* Document Letterhead */}
          <div className="border-b-2 border-forest pb-6 flex items-start justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-forest font-bold">
                <span className="w-2 h-2 rounded-full bg-bright-yellow"></span>
                <span>STATE POLLUTION CONTROL DATA AUDIT · TRACK 2</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal font-sans tracking-tight">
                {activeContent.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-grey font-editorial italic">
                {activeContent.subtitle}
              </p>
            </div>

            <div className="shrink-0 text-right font-mono text-[11px] text-muted-grey space-y-1">
              <div className="flex items-center justify-end gap-2 text-forest">
                <WaterRingLogo size={28} animated={false} />
                <span className="font-bold">LIVING ATLAS</span>
              </div>
              <div>Doc Ref: VG-W/{festival.toUpperCase()}/2026</div>
              <div>Date: {activeContent.metadata.generatedDate}</div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-light-grey/80 border border-forest/15 font-mono text-xs">
            <div>
              <span className="text-muted-grey block text-[10px]">JURISDICTION:</span>
              <span className="font-bold text-charcoal">{activeContent.metadata.jurisdiction}</span>
            </div>
            <div>
              <span className="text-muted-grey block text-[10px]">DATASET WINDOW:</span>
              <span className="font-bold text-forest">{activeContent.metadata.datasetPeriod}</span>
            </div>
            <div>
              <span className="text-muted-grey block text-[10px]">LEGAL CRITERIA:</span>
              <span className="font-bold text-charcoal">CPCB Class B Bathing</span>
            </div>
            <div>
              <span className="text-muted-grey block text-[10px]">AUDITED RECORDS:</span>
              <span className="font-bold text-charcoal">{activeContent.metadata.recordsAnalyzed} Rows</span>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-forest font-bold flex items-center gap-1.5">
              <span>01</span> · {lang === 'en' ? 'EXECUTIVE SUMMARY' : 'कार्यकारी सारांश'}
            </h3>
            <p className="text-sm text-charcoal/90 leading-relaxed font-sans">
              {activeContent.executiveSummary}
            </p>
          </div>

          {/* 2. Priority Ghats Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-forest font-bold flex items-center gap-1.5">
              <span>02</span> · {lang === 'en' ? 'TOP OBSERVED CONCERN GHATS' : 'उच्चतम चिंताजनक घाट'}
            </h3>
            <div className="border border-forest/20 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-light-grey border-b border-forest/15 font-mono text-[10px] uppercase text-charcoal">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Ghat Name</th>
                    <th className="py-2.5 px-3">Water Body</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Findings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10 font-sans">
                  {activeContent.priorityGhats.map((g) => (
                    <tr key={g.site} className="hover:bg-pale-green/20">
                      <td className="py-2.5 px-3 font-mono font-bold text-forest">{g.rank}</td>
                      <td className="py-2.5 px-3 font-bold text-charcoal">{g.site}</td>
                      <td className="py-2.5 px-3 font-mono text-muted-grey">{g.waterBody}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{g.riskScore}/100</td>
                      <td className="py-2.5 px-3 font-mono text-forest font-semibold">{g.confidence}</td>
                      <td className="py-2.5 px-3 text-[11px] text-muted-grey leading-relaxed">{g.findings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Key Evidence Observations */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-forest font-bold flex items-center gap-1.5">
              <span>03</span> · {lang === 'en' ? 'KEY EMPIRICAL OBSERVATIONS' : 'प्रमुख अनुभवजन्य निष्कर्ष'}
            </h3>
            <ul className="space-y-2 text-xs text-charcoal/90 leading-relaxed font-sans">
              {activeContent.keyObservations.map((obs, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-forest font-bold font-mono">[{i + 1}]</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Confidence & Data Gaps */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-risk-warning font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>04</span> · {lang === 'en' ? 'DATA CONFIDENCE & STATUTORY LIMITATIONS' : 'आंकड़ों की विश्वसनीयता एवं सीमाएं'}
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-grey leading-relaxed">
              {activeContent.dataConfidenceAndLimitations.map((lim, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-grey font-mono">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Statutory Sign-off & Disclaimer */}
          <div className="pt-6 border-t-2 border-forest/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] font-mono text-muted-grey">
            <div>{activeContent.statutoryNotes}</div>
            <div className="text-right">
              Generated via Visarjan Ghat Watch deterministic engine.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
