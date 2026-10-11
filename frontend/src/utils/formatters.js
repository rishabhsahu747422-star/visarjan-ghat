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
      return 'Before immersion';
    case 'during':
      return 'During immersion';
    case 'after':
      return 'A week after';
    default:
      return phase || 'Unknown';
  }
}

export function formatValueWithUnit(value, unit, status = 'measured') {
  // Below detection is very low, but it is NOT zero and must never print as one.
  if (status === 'below_detection') return 'Below detection';
  if (status === 'missing' || value === null || value === undefined) return 'Not measured';
  return `${Number(value)} ${unit || ''}`.trim();
}

export function formatDelta(delta, unit = '') {
  if (delta === null || delta === undefined || isNaN(delta)) {
    return 'Not measured at both stages';
  }
  const num = Number(delta);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}${unit ? ' ' + unit : ''}`;
}

/**
 * Risk badge for a ghat. Takes the API's risk_level (D-12 bands), not a score: the browser
 * must not hold a second set of thresholds that can drift from scoring.py.
 */
export function getRiskLevelBadge(riskLevel) {
  if (riskLevel === 'High') {
    return {
      label: 'High Concern',
      bg: 'bg-risk-critical/15 text-risk-critical border-risk-critical/40',
      dot: 'bg-risk-critical',
    };
  }
  if (riskLevel === 'Medium') {
    return {
      label: 'Elevated Risk',
      bg: 'bg-risk-warning/15 text-[#C06014] border-risk-warning/40',
      dot: 'bg-[#C06014]',
    };
  }
  if (riskLevel === 'Low') {
    return {
      label: 'Lower Observed Risk',
      bg: 'bg-forest/15 text-forest border-forest/40',
      dot: 'bg-forest',
    };
  }
  // No level at all: not scored. Never styled like a low-risk ghat.
  return {
    label: 'Not scored',
    bg: 'bg-muted-grey/15 text-muted-grey border-muted-grey/30',
    dot: 'bg-muted-grey',
  };
}
