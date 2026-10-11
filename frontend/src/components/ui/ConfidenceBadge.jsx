import React from 'react';
import { ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';

export default function ConfidenceBadge({ confidence, showReasons = false, className = '' }) {
  if (!confidence) return null;

  const level = confidence.level || 'Unknown';
  let icon = <ShieldCheck className="w-3.5 h-3.5" />;
  let colorStyle = 'bg-forest/10 text-forest border-forest/30';

  if (level === 'Medium') {
    icon = <AlertCircle className="w-3.5 h-3.5 text-[#A57800]" />;
    colorStyle = 'bg-golden-yellow/20 text-[#6B5300] border-golden-yellow/50';
  } else if (level === 'Low') {
    icon = <AlertCircle className="w-3.5 h-3.5 text-risk-warning" />;
    colorStyle = 'bg-risk-warning/15 text-risk-warning border-risk-warning/40';
  } else if (level === 'No Data') {
    icon = <HelpCircle className="w-3.5 h-3.5 text-muted-grey" />;
    colorStyle = 'bg-muted-grey/15 text-muted-grey border-muted-grey/30';
  }

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorStyle}`}
        title={confidence.reasons ? confidence.reasons.join(' · ') : undefined}
      >
        {icon}
        <span>{level} Confidence</span>
      </span>

      {showReasons && confidence.reasons && confidence.reasons.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-grey">
          {confidence.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1">
              <span className="text-forest/60 select-none">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
