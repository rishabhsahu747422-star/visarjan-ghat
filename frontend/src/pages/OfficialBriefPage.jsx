/**
 * The brief the officer forwards.
 *
 * The text comes from GET /api/brief and nothing else. It used to be composed in the browser
 * by utils/briefGenerator.js, which wrote its own sentences and its own numbers; that file is
 * gone (D-24). The backend builds the brief from the computed ranking, caps it at 150 words
 * per language (D-18), ends each top ghat with one action (D-22), and checks every number in
 * the text against the computed data before returning it. If an LLM rephrases it and invents
 * a number, the backend falls back to the template and says so in `source`.
 *
 * This page only displays that text, plus a priority table read straight off the ranking.
 */
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Printer, Copy, Check, FileText, ShieldCheck, AlertTriangle, Globe, RefreshCw,
} from 'lucide-react';
import WorkspaceHeader from '../components/layout/WorkspaceHeader';
import WaterRingLogo from '../components/ui/WaterRingLogo';
import ConfidenceBadge from '../components/ui/ConfidenceBadge';
import { useFestival } from '../context/FestivalContext';
import { api } from '../api';

const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी (Hindi)' },
  { id: 'both', label: 'Both' },
];

export default function OfficialBriefPage() {
  const { onOpenMobileMenu } = useOutletContext() || {};
  const { festival, ghatsAnalysis, noDataGhats, summary } = useFestival();

  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setBrief(null);

    api
      .brief(festival)
      .then((b) => {
        if (cancelled) return;
        setBrief(b);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e.message === '501'
            ? 'The brief needs the ranking. It will appear once the ranking is available.'
            : 'Could not load the brief. Check that the backend is running (see README).'
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [festival, reloadToken]);

  const copyText = brief
    ? lang === 'both'
      ? `${brief.en}\n\n${brief.hi}`
      : lang === 'en'
        ? brief.en
        : brief.hi
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
    } catch {
      // Clipboard API needs a secure context; fall back for plain http on localhost.
      const ta = document.createElement('textarea');
      ta.value = copyText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const topGhats = ghatsAnalysis.slice(0, 3);
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <div className="no-print">
        <WorkspaceHeader
          title="Brief for the officer"
          subtitle={`A short, forwardable brief for ${festival} immersion, built from the readings and checked against them.`}
          onOpenMobileMenu={onOpenMobileMenu}
        />
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Controls */}
        <div className="no-print p-4 rounded-2xl bg-white border border-forest/15 shadow-subtle flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-forest" />
            <div className="inline-flex p-1 bg-light-grey rounded-xl border border-forest/15" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  aria-pressed={lang === l.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    lang === l.id ? 'bg-forest text-white shadow-sm' : 'text-charcoal hover:bg-white/60'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setReloadToken((t) => t + 1)}
              className="px-3.5 py-2 rounded-xl bg-light-grey hover:bg-pale-green border border-forest/20 text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors"
              title="Fetch the brief again from the API"
            >
              <RefreshCw className="w-3.5 h-3.5 text-forest" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!brief}
              className="px-3.5 py-2 rounded-xl bg-light-grey hover:bg-pale-green border border-forest/20 text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-forest" />
                  <span className="text-forest font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-forest" />
                  <span>Copy text</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              disabled={!brief}
              className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-bright-yellow" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-sm text-muted-grey" aria-busy="true">Preparing the brief...</p>
        )}
        {error && (
          <p className="p-4 rounded-xl bg-white border-l-4 border-risk-warning text-sm text-charcoal">{error}</p>
        )}

        {brief && (
          <div className="print-document bg-white rounded-2xl border-2 border-forest/20 shadow-elevated p-8 sm:p-12 space-y-8 font-sans">
            {/* Letterhead */}
            <div className="border-b-2 border-forest pb-6 flex items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-forest font-bold">
                  <span className="w-2 h-2 rounded-full bg-bright-yellow"></span>
                  <span>Visarjan Ghat Watch · {festival} immersion</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal font-sans tracking-tight">
                  Brief for the municipal officer
                </h2>
                <p className="text-xs sm:text-sm text-muted-grey font-editorial italic">
                  MPPCB readings 2023 to 2025 compared with CPCB Class B (outdoor bathing) limits.
                </p>
              </div>

              <div className="shrink-0 text-right font-mono text-[11px] text-muted-grey space-y-1">
                <div className="flex items-center justify-end gap-2 text-forest">
                  <WaterRingLogo size={28} animated={false} />
                  <span className="font-bold">GHAT WATCH</span>
                </div>
                <div>Ref: VGW/{festival.toUpperCase()}/2026</div>
                <div>Printed: {today}</div>
              </div>
            </div>

            {/* Provenance of the text itself */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-light-grey/80 border border-forest/15 font-mono text-xs">
              <div>
                <span className="text-muted-grey block text-[10px]">TEXT SOURCE:</span>
                <span className="font-bold text-charcoal">
                  {brief.source === 'llm' ? 'Rephrased by a model' : 'Template (no model)'}
                </span>
              </div>
              <div>
                <span className="text-muted-grey block text-[10px]">NUMBERS CHECKED:</span>
                <span className={`font-bold ${brief.numbers_validated ? 'text-forest' : 'text-risk-critical'}`}>
                  {brief.numbers_validated ? 'Yes, against the computed data' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-muted-grey block text-[10px]">LIMITS USED:</span>
                <span className="font-bold text-charcoal">CPCB Class B</span>
              </div>
              <div>
                <span className="text-muted-grey block text-[10px]">READINGS LOADED:</span>
                <span className="font-bold text-charcoal">{summary ? summary.rows.toLocaleString() : '—'}</span>
              </div>
            </div>

            {/* 01 · the brief itself, exactly as the API returned it */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-forest font-bold">
                01 · The brief
              </h3>
              {(lang === 'en' || lang === 'both') && (
                <pre lang="en" className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-charcoal/90">
                  {brief.en}
                </pre>
              )}
              {lang === 'both' && <hr className="border-forest/15" />}
              {(lang === 'hi' || lang === 'both') && (
                <pre lang="hi" className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-charcoal/90">
                  {brief.hi}
                </pre>
              )}
            </div>

            {/* 02 · the same ghats, with the evidence behind them */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-forest font-bold">
                02 · Ghats to act on first
              </h3>
              <div className="border border-forest/20 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-light-grey border-b border-forest/15 font-mono text-[10px] uppercase text-charcoal">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Ghat</th>
                      <th className="py-2.5 px-3">Risk</th>
                      <th className="py-2.5 px-3">A week after</th>
                      <th className="py-2.5 px-3">Confidence</th>
                      <th className="py-2.5 px-3">Why</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/10 font-sans">
                    {topGhats.map((g) => (
                      <tr key={g.site}>
                        <td className="py-2.5 px-3 font-mono font-bold text-forest">{g.rank}</td>
                        <td className="py-2.5 px-3 font-bold text-charcoal">
                          {g.site}
                          <span className="block text-[10px] font-normal text-muted-grey font-mono">
                            {g.water_body} · latest data {g.latestYear}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{g.riskLevel}</td>
                        <td className="py-2.5 px-3 text-[11px] text-muted-grey">{g.recoveryText}</td>
                        <td className="py-2.5 px-3">
                          <ConfidenceBadge confidence={g.confidence} />
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-muted-grey leading-relaxed">{g.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 03 · the gaps, stated not hidden */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-risk-warning font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                03 · What this brief does not cover
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-grey leading-relaxed">
                {noDataGhats.map((g) => (
                  <li key={g.site} className="flex items-start gap-2">
                    <span className="font-mono">•</span>
                    <span>
                      <strong className="text-charcoal">{g.site}</strong>: no readings in the data pack.
                      It cannot be ranked, and an untested site is not a clean one.
                    </span>
                  </li>
                ))}
                {ghatsAnalysis
                  .filter((g) => g.confidence.level !== 'High')
                  .map((g) => (
                    <li key={g.site} className="flex items-start gap-2">
                      <span className="font-mono">•</span>
                      <span>
                        <strong className="text-charcoal">{g.site}</strong>: {g.confidence.level} confidence
                        {g.confidence.reasons.length > 0 && ` — ${g.confidence.reasons.join('; ')}`}.
                      </span>
                    </li>
                  ))}
                <li className="flex items-start gap-2">
                  <span className="font-mono">•</span>
                  <span>
                    The MPPCB reports print no units; the standard unit for each test is assumed.
                    Few readings per ghat, so the immersion figures are indicative, not statistical.
                  </span>
                </li>
              </ul>
            </div>

            {/* Sign-off */}
            <div className="pt-6 border-t-2 border-forest/20 flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-[10px] font-mono text-muted-grey">
              <div className="max-w-md leading-relaxed">
                Past readings only, not a forecast for 20 Oct 2026. Readings are compared with a
                published limit; this is not a health assessment. Every number in the brief is
                checked against the computed data before it is shown.
              </div>
              <div className="text-right flex items-center gap-1.5 shrink-0">
                {brief.numbers_validated ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-risk-warning" />
                )}
                <FileText className="w-3.5 h-3.5" />
                <span>Source pages are on every reading in the ghat pages.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
