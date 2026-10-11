/**
 * Environmental water-quality calculations for Visarjan Ghat Watch.
 * Based on CPCB Class B (Outdoor Bathing) standards and MPPCB methodology.
 * Rule: Missing is never clean. BDL is below detection (not 0, not missing).
 */

export const CPCB_CRITERIA = {
  DO: { min: 5.0, unit: 'mg/l' },
  BOD: { max: 3.0, unit: 'mg/l' },
  pH: { min: 6.5, max: 8.5, unit: 'pH' },
};

/**
 * Breach severity (0 to 1) for individual parameter readings.
 * 0 = within legal CPCB bathing limit.
 * >0 = fractional breach distance past limit, capped at 1.0.
 */
export function calculateBreachSeverity(parameter, value) {
  if (value === null || value === undefined || isNaN(value)) {
    return null;
  }

  const v = Number(value);
  if (parameter === 'Dissolved oxygen') {
    // Min 5.0 mg/l
    if (v >= 5.0) return 0.0;
    const severity = (5.0 - v) / 5.0;
    return Math.max(0.0, Math.min(1.0, severity));
  }

  if (parameter === 'BOD') {
    // Max 3.0 mg/l
    if (v <= 3.0) return 0.0;
    const severity = (v - 3.0) / 3.0;
    return Math.max(0.0, Math.min(1.0, severity));
  }

  if (parameter === 'pH') {
    // Min 6.5, Max 8.5
    if (v >= 6.5 && v <= 8.5) return 0.0;
    const distance = Math.max(6.5 - v, v - 8.5);
    const severity = distance / 1.0;
    return Math.max(0.0, Math.min(1.0, severity));
  }

  // Parameters with no Class B limit (COD, solids, metals, turbidity)
  return null;
}

/**
 * Phase severity across core Class B parameters (DO, BOD, pH).
 * Returns null if no measured parameters exist in this phase.
 */
export function calculatePhaseSeverity(phaseReadings) {
  if (!phaseReadings || phaseReadings.length === 0) return null;

  const validSeverities = [];
  const targetParams = ['Dissolved oxygen', 'BOD', 'pH'];

  for (const param of targetParams) {
    const reading = phaseReadings.find(
      (r) => r.parameter === param && r.status === 'measured' && r.value !== null
    );
    if (reading) {
      const s = calculateBreachSeverity(param, reading.value);
      if (s !== null) validSeverities.push(s);
    }
  }

  if (validSeverities.length === 0) return null;
  const sum = validSeverities.reduce((acc, s) => acc + s, 0);
  return sum / validSeverities.length;
}

/**
 * Calculate impact delta (during - pre) and recovery delta (after - pre)
 * per parameter or severity, only when both values exist.
 */
export function calculateDeltas(preVal, duringVal, afterVal) {
  const impact =
    duringVal !== null && duringVal !== undefined && preVal !== null && preVal !== undefined
      ? Number((duringVal - preVal).toFixed(2))
      : null;

  const recovery =
    afterVal !== null && afterVal !== undefined && preVal !== null && preVal !== undefined
      ? Number((afterVal - preVal).toFixed(2))
      : null;

  return { impact, recovery };
}

/**
 * Assigns one of 4 quadrant categories:
 * - Already Poor: elevated baseline, lower immersion change
 * - Immersion Impact: lower baseline, elevated immersion change
 * - Combined Concern: elevated baseline AND elevated immersion change
 * - Lower Observed Impact: lower baseline AND lower immersion change
 */
export function classifyQuadrant(baselineSeverity, immersionDamage) {
  if (baselineSeverity === null || immersionDamage === null) {
    return 'Insufficient Data';
  }

  const BASELINE_THRESHOLD = 0.35;
  const DAMAGE_THRESHOLD = 0.15;

  const isHighBaseline = baselineSeverity >= BASELINE_THRESHOLD;
  const isHighDamage = immersionDamage >= DAMAGE_THRESHOLD;

  if (isHighBaseline && isHighDamage) return 'Combined Concern';
  if (isHighBaseline && !isHighDamage) return 'Already Poor';
  if (!isHighBaseline && isHighDamage) return 'Immersion Impact';
  return 'Lower Observed Impact';
}

/**
 * Recency and phase-weighted risk score (0-100).
 */
export function calculateRiskScore(yearlyPhaseSeverities) {
  // yearlyPhaseSeverities: { 2025: { pre, during, after }, 2024: ..., 2023: ... }
  const yearWeights = { 2025: 0.5, 2024: 0.3, 2023: 0.2 };
  const phaseWeights = { during: 0.5, after: 0.3, pre: 0.2 };

  let totalWeightedScore = 0;
  let totalYearWeight = 0;

  for (const [yearStr, phases] of Object.entries(yearlyPhaseSeverities)) {
    const year = Number(yearStr);
    const yWeight = yearWeights[year] || 0.2;

    let phaseSum = 0;
    let phaseWeightSum = 0;

    for (const [phaseKey, weight] of Object.entries(phaseWeights)) {
      const sev = phases[phaseKey];
      if (sev !== null && sev !== undefined) {
        phaseSum += sev * weight;
        phaseWeightSum += weight;
      }
    }

    if (phaseWeightSum > 0) {
      const yearScore = phaseSum / phaseWeightSum;
      totalWeightedScore += yearScore * yWeight;
      totalYearWeight += yWeight;
    }
  }

  if (totalYearWeight === 0) return null;
  const normalized = totalWeightedScore / totalYearWeight;
  return Math.round(normalized * 100);
}
