import React from 'react';
import { getMissingDataRegister } from '../../data/dataService';
import { useFestival } from '../../context/FestivalContext';
import { AlertCircle, HelpCircle, FileX } from 'lucide-react';

export default function MissingDataRegister({ className = '' }) {
  const { festival } = useFestival();
  const register = getMissingDataRegister(festival);

  return (
    <div className={`bg-white rounded-2xl border border-forest/15 shadow-card p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <h3 className="font-bold text-base text-charcoal font-sans flex items-center gap-2">
            Missing-Data Register & Interpretive Impact
            <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
          </h3>
          <p className="text-xs text-muted-grey mt-0.5">
            Documenting data gaps, unavailable report tables, and how each absence constraints analytical conclusions.
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-golden-yellow/20 text-charcoal border border-golden-yellow/40 self-start sm:self-auto">
          Scientific Honesty
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-light-grey/80 border-b border-forest/20 text-charcoal font-mono text-[11px] uppercase">
              <th className="py-2.5 px-3">Ghat / Scope</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Observed Gap Condition</th>
              <th className="py-2.5 px-3">Impact on Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/10">
            {register.map((row, i) => (
              <tr key={i} className="hover:bg-pale-green/20 transition-colors">
                <td className="py-3 px-3 font-semibold text-charcoal font-sans">
                  {row.site}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-light-grey border border-forest/15 text-muted-grey">
                    {row.category}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-risk-warning flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{row.condition}</span>
                </td>
                <td className="py-3 px-3 text-muted-grey leading-relaxed">
                  {row.impact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-forest/10 p-3 bg-pale-green/30 rounded-xl text-xs text-charcoal flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Fundamental Methodological Axiom:</strong> In Visarjan Ghat Watch, missing data is explicitly handled as unknown, never inferred as passing or compliant (0). Where baseline, peak, or recovery readings are absent, the platform caps confidence levels and highlights data requirements for future monitoring cycles.
        </p>
      </div>
    </div>
  );
}
