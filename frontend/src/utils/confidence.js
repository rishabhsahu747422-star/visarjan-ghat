/**
 * Confidence classification module.
 * Evaluates observation coverage across years and phases + site match confidence.
 */

export function calculateGhatConfidence(siteName, readingsForSite, siteMeta = {}) {
  // Arch Bridge ghat or no readings
  if (!readingsForSite || readingsForSite.length === 0) {
    return {
      level: 'No Data',
      badgeClass: 'bg-muted-grey/20 text-muted-grey border-muted-grey/30',
      reasons: ['No historical observations in MPPCB data pack. Requires pre-event baseline testing.']
    };
  }

  const reasons = [];
  const years = [...new Set(readingsForSite.map((r) => r.year))].sort((a, b) => b - a);
  const latestYear = years[0];

  // Check site match confidence
  const siteMatch = siteMeta.site_match_confidence || 'high';
  if (siteMatch === 'medium') {
    reasons.push('Sampling location name variance in reports (e.g. Kamla Park kund vs Lower Lake ghat). Capped at Medium.');
  }

  // Check latest year presence (2025)
  if (!years.includes(2025)) {
    reasons.push('Missing 2025 festival report table entirely.');
  }

  // Check phase coverage in latest year
  const latestReadings = readingsForSite.filter((r) => r.year === latestYear);
  const latestPhases = [...new Set(latestReadings.filter((r) => r.status === 'measured').map((r) => r.phase))];

  if (!latestPhases.includes('pre')) reasons.push(`No baseline (pre) measurement recorded in ${latestYear}.`);
  if (!latestPhases.includes('during')) reasons.push(`No during-immersion measurement recorded in ${latestYear}.`);
  if (!latestPhases.includes('after')) reasons.push(`No post-immersion (after) measurement recorded in ${latestYear}.`);

  // Check multi-year continuity
  const hasMultipleYears = years.length >= 2;
  if (!hasMultipleYears) {
    reasons.push('Only a single year of observations is available.');
  }

  // Determine Level
  let level = 'High';
  if (!years.includes(2025) || latestPhases.length <= 1) {
    level = 'Low';
  } else if (reasons.length > 0 || siteMatch === 'medium') {
    level = 'Medium';
  }

  let badgeClass = 'bg-forest/10 text-forest border-forest/30';
  if (level === 'Medium') {
    badgeClass = 'bg-golden-yellow/20 text-charcoal border-golden-yellow/50';
  } else if (level === 'Low') {
    badgeClass = 'bg-risk-warning/15 text-risk-warning border-risk-warning/40';
  }

  return {
    level,
    badgeClass,
    reasons: reasons.length > 0 ? reasons : ['All core parameters tested across pre, during, and after phases across multiple consecutive years.']
  };
}
