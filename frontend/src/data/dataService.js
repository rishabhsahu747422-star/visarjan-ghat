import rawReadings from './bhopal_readings.json';
import { GHAT_META, CPCB_LIMITS, CONTEXT_PARAMETERS } from './ghatMeta';
import {
  calculateBreachSeverity,
  calculatePhaseSeverity,
  calculateDeltas,
  classifyQuadrant,
  calculateRiskScore,
} from '../utils/calculations';
import { calculateGhatConfidence } from '../utils/confidence';
import { slugifySite } from '../utils/formatters';

export function getAllReadings() {
  return rawReadings;
}

export function getGoldenSummary() {
  const doMeas = rawReadings.filter(
    (r) => r.parameter === 'Dissolved oxygen' && r.status === 'measured'
  );
  const doBelow5 = doMeas.filter((r) => r.value < 5.0);

  const bodMeas = rawReadings.filter(
    (r) => r.parameter === 'BOD' && r.status === 'measured'
  );
  const bodAbove3 = bodMeas.filter((r) => r.value > 3.0);

  const sitesWithData = [...new Set(rawReadings.map((r) => r.site))];

  return {
    rows: rawReadings.length,
    do_readings: doMeas.length,
    do_below_5: doBelow5.length,
    bod_readings: bodMeas.length,
    bod_above_3: bodAbove3.length,
    ghats_count: sitesWithData.length,
    total_sites: sitesWithData.length + GHAT_META.no_data_sites.length,
    monitoring_years: [2023, 2024, 2025],
    festivals: ['Durga', 'Ganesh'],
    limits: CPCB_LIMITS,
    context_only: CONTEXT_PARAMETERS,
  };
}

/**
 * Returns analytical model for all ghats under the specified festival.
 */
export function getGhatsAnalysis(festival = 'Durga') {
  const sitesWithData = Object.keys(GHAT_META.ghats);

  const analysis = sitesWithData.map((site) => {
    const meta = GHAT_META.ghats[site] || {};
    const siteReadings = rawReadings.filter(
      (r) => r.site === site && r.festival === festival
    );

    const years = [...new Set(siteReadings.map((r) => r.year))].sort(
      (a, b) => b - a
    );
    const latestYear = years[0] || null;

    // Build yearly phase severities
    const yearlyPhaseSeverities = {};
    const sourcePages = new Set();

    [2025, 2024, 2023].forEach((yr) => {
      yearlyPhaseSeverities[yr] = { pre: null, during: null, after: null };
      ['pre', 'during', 'after'].forEach((ph) => {
        const phReadings = siteReadings.filter(
          (r) => r.year === yr && r.phase === ph
        );
        phReadings.forEach((r) => {
          if (r.source_page) sourcePages.add(r.source_page);
        });
        const sev = calculatePhaseSeverity(phReadings);
        yearlyPhaseSeverities[yr][ph] = sev;
      });
    });

    // Evaluate baseline, during, after severity for the latest available year
    let baselineSeverity = null;
    let duringSeverity = null;
    let afterSeverity = null;

    if (latestYear && yearlyPhaseSeverities[latestYear]) {
      baselineSeverity = yearlyPhaseSeverities[latestYear].pre;
      duringSeverity = yearlyPhaseSeverities[latestYear].during;
      afterSeverity = yearlyPhaseSeverities[latestYear].after;
    }

    // Fallback to previous year if latest year had missing baseline
    if (baselineSeverity === null && years.length > 1) {
      for (const altYr of years.slice(1)) {
        if (yearlyPhaseSeverities[altYr].pre !== null) {
          baselineSeverity = yearlyPhaseSeverities[altYr].pre;
          break;
        }
      }
    }

    // Immersion damage is the positive worsening from pre to during
    let immersionDamage = null;
    let severityDelta = null;
    let recoveryDelta = null;

    if (duringSeverity !== null && baselineSeverity !== null) {
      severityDelta = Number((duringSeverity - baselineSeverity).toFixed(3));
      immersionDamage = Math.max(0, severityDelta);
    }

    if (afterSeverity !== null && baselineSeverity !== null) {
      recoveryDelta = Number((afterSeverity - baselineSeverity).toFixed(3));
    }

    // DO & BOD deltas for latest available pair
    let doDelta = null;
    let bodDelta = null;
    let latestPreDO = null;
    let latestDuringDO = null;
    let latestPreBOD = null;
    let latestDuringBOD = null;

    if (latestYear) {
      const getVal = (param, ph) => {
        const found = siteReadings.find(
          (r) =>
            r.year === latestYear &&
            r.parameter === param &&
            r.phase === ph &&
            r.status === 'measured'
        );
        return found ? found.value : null;
      };

      latestPreDO = getVal('Dissolved oxygen', 'pre');
      latestDuringDO = getVal('Dissolved oxygen', 'during');
      if (latestPreDO !== null && latestDuringDO !== null) {
        doDelta = Number((latestDuringDO - latestPreDO).toFixed(2));
      }

      latestPreBOD = getVal('BOD', 'pre');
      latestDuringBOD = getVal('BOD', 'during');
      if (latestPreBOD !== null && latestDuringBOD !== null) {
        bodDelta = Number((latestDuringBOD - latestPreBOD).toFixed(2));
      }
    }

    const quadrant = classifyQuadrant(baselineSeverity, immersionDamage);
    const riskScore = calculateRiskScore(yearlyPhaseSeverities);
    const confidence = calculateGhatConfidence(site, siteReadings, meta);

    // Formulate a transparent, data-grounded reason
    let reason = 'Insufficient comparative readings.';
    if (quadrant === 'Already Poor') {
      reason = `Baseline hypoxia/organic loading already elevated before immersion (${(baselineSeverity * 100).toFixed(0)}% breach).`;
    } else if (quadrant === 'Combined Concern') {
      reason = `High baseline pollution coupled with pronounced immersion-phase deterioration.`;
    } else if (quadrant === 'Immersion Impact') {
      reason = `Relatively clean baseline followed by substantial immersion-period oxygen depletion or organic spike.`;
    } else if (quadrant === 'Lower Observed Impact') {
      reason = `Water quality remained comparatively closer to Class B bathing standards.`;
    } else if (confidence.level === 'Low') {
      reason = `Incomplete observation phases in latest report (requires targeted testing).`;
    }

    return {
      site,
      slug: slugifySite(site),
      water_body: meta.water_body,
      bmc_list_2026: meta.bmc_list_2026,
      description: meta.description,
      siteMeta: meta,
      festival,
      yearsWithData: years,
      latestYear,
      baselineSeverity,
      duringSeverity,
      afterSeverity,
      immersionDamage,
      severityDelta,
      recoveryDelta,
      doDelta,
      bodDelta,
      latestPreDO,
      latestDuringDO,
      latestPreBOD,
      latestDuringBOD,
      quadrant,
      riskScore,
      confidence,
      reason,
      sourcePages: Array.from(sourcePages).sort((a, b) => a - b),
      hasData: siteReadings.length > 0,
      totalReadings: siteReadings.length,
      yearlyPhaseSeverities,
    };
  });

  // Include no_data_sites (e.g. Arch Bridge ghat)
  const noDataGhats = GHAT_META.no_data_sites.map((item) => ({
    site: item.name,
    slug: slugifySite(item.name),
    water_body: item.water_body,
    bmc_list_2026: item.bmc_list_2026,
    description: item.note,
    siteMeta: {
      water_body: item.water_body,
      bmc_list_2026: item.bmc_list_2026,
      site_match_confidence: 'no_data',
      description: item.note,
    },
    festival,
    yearsWithData: [],
    latestYear: null,
    baselineSeverity: null,
    duringSeverity: null,
    afterSeverity: null,
    immersionDamage: null,
    severityDelta: null,
    recoveryDelta: null,
    doDelta: null,
    bodDelta: null,
    latestPreDO: null,
    latestDuringDO: null,
    latestPreBOD: null,
    latestDuringBOD: null,
    quadrant: 'Insufficient Data',
    riskScore: null,
    confidence: {
      level: 'No Data',
      badgeClass: 'bg-muted-grey/20 text-muted-grey border-muted-grey/30',
      reasons: ['No historical observations in MPPCB data pack. Requires pre-immersion testing before public use.']
    },
    reason: 'Active on BMC 2026 news list but completely absent from MPPCB data pack.',
    sourcePages: [],
    hasData: false,
    totalReadings: 0,
    yearlyPhaseSeverities: {},
  }));

  const allGhats = [...analysis, ...noDataGhats];

  // Sort by riskScore descending (with nulls placed at end)
  allGhats.sort((a, b) => {
    if (a.riskScore === null && b.riskScore === null) return 0;
    if (a.riskScore === null) return 1;
    if (b.riskScore === null) return -1;
    return b.riskScore - a.riskScore;
  });

  // Assign 1-based ranks to sites that have calculable risk scores
  let rankCounter = 1;
  return allGhats.map((g) => {
    if (g.riskScore !== null) {
      return { ...g, rank: rankCounter++ };
    }
    return { ...g, rank: null };
  });
}

/**
 * Retrieve comprehensive detail for an individual ghat by slug or name.
 */
export function getGhatDetail(identifier, festival = 'Durga') {
  const ghats = getGhatsAnalysis(festival);
  const ghat = ghats.find(
    (g) => g.slug === identifier || g.site.toLowerCase() === identifier.toLowerCase()
  );

  if (!ghat) return null;

  const readings = rawReadings.filter(
    (r) => r.site === ghat.site && r.festival === festival
  );

  return {
    ...ghat,
    rawReadings: readings,
  };
}

/**
 * Matrix of ghats vs parameters vs phases for Coverage Heatmap.
 */
export function getCoverageMatrix(festival = 'Durga') {
  const parameters = [
    'pH',
    'Dissolved oxygen',
    'BOD',
    'COD',
    'Total solids',
    'Dissolved solids',
    'Turbidity',
    'Conductivity',
    'Lead',
  ];
  const phases = ['pre', 'during', 'after'];
  const sites = Object.keys(GHAT_META.ghats);

  const matrix = sites.map((site) => {
    const siteReadings = rawReadings.filter(
      (r) => r.site === site && r.festival === festival && r.year === 2025
    );

    const cells = {};
    parameters.forEach((param) => {
      cells[param] = {};
      phases.forEach((phase) => {
        const found = siteReadings.find(
          (r) => r.parameter === param && r.phase === phase
        );
        if (!found) {
          cells[param][phase] = { status: 'missing', label: 'Not sampled' };
        } else if (found.status === 'below_detection') {
          cells[param][phase] = { status: 'below_detection', value: found.value_as_printed, label: 'BDL' };
        } else if (found.status === 'measured') {
          cells[param][phase] = { status: 'measured', value: found.value, unit: found.unit_assumed, label: `${found.value}` };
        } else {
          cells[param][phase] = { status: 'missing', label: 'Missing' };
        }
      });
    });

    return {
      site,
      slug: slugifySite(site),
      cells,
    };
  });

  return {
    parameters,
    phases,
    matrix,
    year: 2025,
    festival,
  };
}

/**
 * Missing data register inventory.
 */
export function getMissingDataRegister(festival = 'Durga') {
  return [
    {
      site: 'Bairagarh (Sant Hirdaram) kund',
      condition: 'Entire Durga 2025 table absent in MPPCB report',
      impact: 'Cannot calculate 2025 Durga immersion impact. Forced to fall back to 2024 historical observations; confidence capped at Low.',
      category: 'Missing Report Table'
    },
    {
      site: 'Malikhedi kund',
      condition: 'Entire Durga 2025 table absent in MPPCB report',
      impact: 'No post-immersion or during-immersion 2025 Durga observations available. Evaluated on multi-year historical trend.',
      category: 'Missing Report Table'
    },
    {
      site: 'Arch Bridge ghat',
      condition: 'No historical MPPCB monitoring data exists across any year',
      impact: 'Site listed on BMC 2026 public announcements without baseline records. Cannot be ranked; marked for urgent pre-immersion testing.',
      category: 'Unmonitored Site'
    },
    {
      site: 'Rani Kamlapati ghat / Kamla Park kund',
      condition: 'Location nomenclature variance across report tables',
      impact: 'Ganesh reports refer to Kamla Park Kund, whereas Durga reports list Lower Lake Ghat. Site match confidence capped at Medium.',
      category: 'Nomenclature Discrepancy'
    },
    {
      site: 'All Ghats',
      condition: 'Suspended solids omitted in Durga 2023 & 2025 tables',
      impact: 'Total solids available, but particle partitioning cannot be compared uniformly across all festival cycles.',
      category: 'Parameter Gap'
    },
    {
      site: 'All Ghats',
      condition: 'No heavy metal bathing standard in CPCB Class B',
      impact: 'Chromium, Lead, Zinc, and Copper are reported but treated as environmental context rather than legal bathing breach scores.',
      category: 'Standard Limitation'
    }
  ];
}
