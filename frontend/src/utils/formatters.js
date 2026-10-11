/**
 * UI formatting and string utilities for Visarjan Ghat Watch.
 */

export function slugifySite(siteName) {
  if (!siteName) return '';
  return siteName
    .toLowerCase()
    .replace(/[()\/]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}

export function formatPhase(phase) {
  switch (phase?.toLowerCase()) {
    case 'pre':
      return 'Pre-Immersion (Baseline)';
    case 'during':
      return 'During Immersion';
    case 'after':
      return 'Post-Immersion (1 Week After)';
    default:
      return phase || 'Unknown';
  }
}

export function formatValueWithUnit(value, unit, status = 'measured') {
  if (status === 'below_detection') return 'BDL (< limit)';
  if (status === 'missing' || value === null || value === undefined) return 'Not Sampled';
  return `${Number(value).toFixed(1)} ${unit || ''}`.trim();
}

export function formatDelta(delta, unit = '') {
  if (delta === null || delta === undefined || isNaN(delta)) {
    return 'Insufficient data';
  }
  const num = Number(delta);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}${unit ? ' ' + unit : ''}`;
}

export function getRiskLevelBadge(score) {
  if (score === null || score === undefined) {
    return {
      label: 'Insufficient Data',
      bg: 'bg-muted-grey/15 text-muted-grey border-muted-grey/30',
      dot: 'bg-muted-grey'
    };
  }
  if (score >= 65) {
    return {
      label: 'High Concern',
      bg: 'bg-risk-critical/15 text-risk-critical border-risk-critical/40',
      dot: 'bg-risk-critical'
    };
  }
  if (score >= 40) {
    return {
      label: 'Elevated Risk',
      bg: 'bg-risk-warning/15 text-[#C06014] border-risk-warning/40',
      dot: 'bg-[#C06014]'
    };
  }
  if (score >= 20) {
    return {
      label: 'Moderate Impact',
      bg: 'bg-golden-yellow/20 text-charcoal border-golden-yellow/50',
      dot: 'bg-golden-yellow'
    };
  }
  return {
    label: 'Lower Observed Risk',
    bg: 'bg-forest/15 text-forest border-forest/40',
    dot: 'bg-forest'
  };
}
