/**
 * Data service: the ONLY place the UI gets numbers, and every number comes from the API.
 *
 * Before integration this file computed risk scores, confidence and quadrants in the browser
 * from a bundled copy of the CSV. That is gone (D-24). Scoring lives in backend/app/scoring.py,
 * is covered by tests, and is the single source of truth — two implementations would drift and
 * the jury checks that every number traces to one formula and a report page.
 *
 * This module only RESHAPES the API payload into the field names the design already uses.
 * It never derives a new finding from raw readings. The two places it does arithmetic on
 * already-computed severities are marked DERIVED and listed in docs/INTEGRATION.md.
 *
 * Contract: docs/TEAM.md. Types: src/api.ts.
 */
import { api } from '../api';
import { slugifySite } from '../utils/formatters';
import { GHAT_DESCRIPTIONS } from './ghatMeta';

// ---------------------------------------------------------------------------
// wording — fixed by docs/DECISIONS.md, do not improvise
// ---------------------------------------------------------------------------

/**
 * Quadrant label per API enum. `stable` is "No clear rise during immersion" and never
 * "within limits": a stable ghat can still breach the limits (D-19).
 */
const QUADRANT_LABEL = {
  already_bad: 'Poor before immersion',
  damaged_by_immersion: 'Worse during immersion',
  both: 'Poor before, worse during',
  stable: 'No clear rise during immersion',
  unknown: 'Phases not comparable',
};

/**
 * Recovery wording. `good` means NO WORSE than before immersion, never "clean" or
 * "recovered" (D-15, D-21). A ghat can be "no worse" and still be far above the limit.
 */
export function recoveryLabel(recovery, afterSeverity) {
  if (recovery === 'poor') return 'Worse a week later';
  if (recovery === 'unknown') return 'After immersion: not measured';
  return afterSeverity !== null && afterSeverity > 0
    ? 'No worse a week later, still above limits'
    : 'Within limits a week later';
}

// ---------------------------------------------------------------------------
// mapping
// ---------------------------------------------------------------------------

const pct = (v) => (v === null || v === undefined ? null : v);

/** Map one ranked ghat from /api/ranking into the shape the design components read. */
function mapRankedGhat(g, festival) {
  const years = [...new Set((g.evidence || []).map((e) => e.year))].sort((a, b) => b - a);
  const sourcePages = [...new Set((g.evidence || []).map((e) => e.source_page).filter((p) => p !== null))]
    .sort((a, b) => a - b);

  const baseline = pct(g.baseline_severity);
  const damage = pct(g.immersion_damage);
  const after = pct(g.after_severity);

  // DERIVED (1): the API publishes the pre severity and the rise during immersion, not the
  // during severity itself. Shown only as a display figure in the phase breakdown.
  const duringSeverity = baseline !== null && damage !== null ? Number((baseline + damage).toFixed(4)) : null;

  // DERIVED (2): how the after-phase severity compares with the baseline. The label above,
  // not this number, is what states whether the water is still above the limits.
  const recoveryDelta = after !== null && baseline !== null ? Number((after - baseline).toFixed(4)) : null;

  return {
    site: g.site,
    slug: slugifySite(g.site),
    water_body: g.water_body,
    bmc_list_2026: g.bmc_list_2026,
    description: GHAT_DESCRIPTIONS[g.site] || null,
    festival,

    rank: g.rank,
    riskScore: g.risk_score === null ? null : Math.round(g.risk_score * 100),
    riskScoreRaw: g.risk_score,
    riskLevel: g.risk_level,
    testPriority: g.test_priority,

    baselineSeverity: baseline,
    duringSeverity,
    afterSeverity: after,
    immersionDamage: damage,
    severityDelta: damage, // the API floors the immersion delta at 0; it never reports a fall
    recoveryDelta,

    quadrantKey: g.quadrant,
    quadrant: QUADRANT_LABEL[g.quadrant] || QUADRANT_LABEL.unknown,
    recovery: g.recovery,
    recoveryText: recoveryLabel(g.recovery, after),

    confidence: { level: g.confidence.level, reasons: g.confidence.reasons },
    reason: g.reason,

    yearsWithData: years,
    latestYear: g.latest_data_year,
    sourcePages,
    totalReadings: (g.evidence || []).length,
    hasData: true,
    evidence: g.evidence || [],

    // filled in later by the per-ghat fetch
    doDelta: null,
    bodDelta: null,
    latestPreDO: null,
    latestDuringDO: null,
    latestPreBOD: null,
    latestDuringBOD: null,
  };
}

/**
 * A site with no readings is never ranked and never scored (PRD s6). It is not a clean site,
 * it is an untested one, so every number is null and the confidence level says "No Data".
 */
function mapNoDataSite(s, festival) {
  return {
    site: s.name,
    slug: slugifySite(s.name),
    water_body: s.water_body || null,
    bmc_list_2026: s.bmc_list_2026 || 'unknown',
    description: GHAT_DESCRIPTIONS[s.name] || s.note || null,
    festival,

    rank: null,
    riskScore: null,
    riskScoreRaw: null,
    riskLevel: null,
    testPriority: null,

    baselineSeverity: null,
    duringSeverity: null,
    afterSeverity: null,
    immersionDamage: null,
    severityDelta: null,
    recoveryDelta: null,

    quadrantKey: 'unknown',
    quadrant: 'No readings',
    recovery: 'unknown',
    recoveryText: 'After immersion: not measured',

    confidence: {
      level: 'No Data',
      reasons: [s.note || 'No readings in the MPPCB data pack. Test before use.'],
    },
    reason: s.note || 'No readings in the MPPCB data pack for this festival. Test before use.',

    yearsWithData: [],
    latestYear: null,
    sourcePages: [],
    totalReadings: 0,
    hasData: false,
    evidence: [],

    doDelta: null,
    bodDelta: null,
    latestPreDO: null,
    latestDuringDO: null,
    latestPreBOD: null,
    latestDuringBOD: null,
  };
}

// ---------------------------------------------------------------------------
// fetchers
// ---------------------------------------------------------------------------

/** Golden numbers straight from /api/summary. The UI never counts rows itself. */
export async function fetchGoldenSummary() {
  const s = await api.summary();
  return {
    ...s,
    monitoring_years: [2023, 2024, 2025],
    festivals: ['Durga', 'Ganesh'],
  };
}

/** Ranked ghats and the untested sites, kept apart so a gap can never look like a rank. */
export async function fetchGhatsAnalysis(festival) {
  const r = await api.ranking(festival);
  return {
    festival: r.festival,
    formulaVersion: r.formula_version,
    ranked: r.ranking.map((g) => mapRankedGhat(g, festival)),
    noData: (r.no_data_sites || []).map((s) => mapNoDataSite(s, festival)),
  };
}

/** Pull the phase values for one year out of the impact rows the API already computed. */
function phaseValues(impact, year, parameter) {
  const row = (impact || []).find((i) => i.year === year && i.parameter === parameter);
  if (!row) return { pre: null, during: null, after: null, duringMinusPre: null };
  return { pre: row.pre, during: row.during, after: row.after, duringMinusPre: row.during_minus_pre };
}

/**
 * One ghat: the ranked summary plus its readings and impact rows from /api/ghat.
 * `site` is sent as a URL-encoded query parameter — one ghat name contains a slash.
 */
export async function fetchGhatDetail(ghat, festival) {
  if (!ghat) return null;
  if (!ghat.hasData) return { ...ghat, rawReadings: [], impact: [] };

  const d = await api.ghat(ghat.site, festival);
  const year = ghat.latestYear;
  const doVals = phaseValues(d.impact, year, 'Dissolved oxygen');
  const bodVals = phaseValues(d.impact, year, 'BOD');

  return {
    ...ghat,
    rawReadings: d.readings,
    impact: d.impact,
    totalReadings: d.readings.length,
    latestPreDO: doVals.pre,
    latestDuringDO: doVals.during,
    doDelta: doVals.duringMinusPre,
    latestPreBOD: bodVals.pre,
    latestDuringBOD: bodVals.during,
    bodDelta: bodVals.duringMinusPre,
  };
}

/**
 * Coverage matrix for the latest year in the data: which parameter was measured at which phase.
 * Built from /api/ghat, so a blank cell is a blank cell in the report, never a zero.
 */
export async function fetchCoverageMatrix(ranked, festival) {
  const parameters = [
    'pH', 'Dissolved oxygen', 'BOD', 'COD', 'Total solids',
    'Dissolved solids', 'Turbidity', 'Conductivity', 'Lead',
  ];
  const phases = ['pre', 'during', 'after'];

  const details = await Promise.all(ranked.map((g) => api.ghat(g.site, festival).catch(() => null)));

  const allYears = details.flatMap((d) => (d ? d.readings.map((r) => r.year) : []));
  const year = allYears.length ? Math.max(...allYears) : null;

  const matrix = ranked.map((g, i) => {
    const d = details[i];
    const cells = {};
    parameters.forEach((param) => {
      cells[param] = {};
      phases.forEach((phase) => {
        const found = d
          ? d.readings.find((r) => r.year === year && r.parameter === param && r.phase === phase)
          : null;
        if (!found) {
          cells[param][phase] = { status: 'missing', label: 'Not sampled' };
        } else if (found.status === 'below_detection') {
          cells[param][phase] = { status: 'below_detection', value: found.value_as_printed, label: 'BDL' };
        } else if (found.status === 'measured' && found.value !== null) {
          cells[param][phase] = { status: 'measured', value: found.value, label: String(found.value) };
        } else {
          cells[param][phase] = { status: 'missing', label: 'Not sampled' };
        }
      });
    });
    return { site: g.site, slug: g.slug, cells };
  });

  return { parameters, phases, matrix, year, festival };
}

/**
 * Register of what the data does not cover. Static text, matched to PRD section 6 and the
 * README "Limits we state openly"; the untested-site rows are filled from the API.
 */
export function getMissingDataRegister(noDataSites = []) {
  const register = [
    {
      site: 'Bairagarh (Sant Hirdaram) kund',
      condition: 'No Durga 2025 table in the MPPCB report',
      impact: 'The 2025 Durga immersion cannot be assessed. Ranked on 2023 and 2024 readings, with confidence capped at Low.',
      category: 'Missing report table',
    },
    {
      site: 'Malikhedi kund',
      condition: 'No Durga 2025 table in the MPPCB report',
      impact: 'No 2025 Durga during- or after-immersion readings. Ranked on earlier years, with confidence capped at Low.',
      category: 'Missing report table',
    },
    {
      site: 'Rani Kamlapati ghat / Kamla Park kund',
      condition: 'The reports use two different names for it',
      impact: 'Ganesh tables say Kamla Park kund, Durga tables say Lower Lake ghat. It may be two places, so site match confidence is capped at Medium.',
      category: 'Name mismatch',
    },
    {
      site: 'All ghats',
      condition: 'Suspended solids missing in Durga 2023 and 2025',
      impact: 'Total solids are reported, but the split between dissolved and suspended cannot be compared across every festival.',
      category: 'Parameter gap',
    },
    {
      site: 'All ghats',
      condition: 'No Class B limit for the four metals tested',
      impact: 'Chromium, lead, zinc and copper are shown for context only and never counted as a breach.',
      category: 'Standard limitation',
    },
    {
      site: 'All ghats',
      condition: 'The reports print no units',
      impact: 'We use the standard unit for each test, as stated in the data pack. Disclosed on this page and in the README.',
      category: 'Assumption',
    },
  ];

  const untested = noDataSites.map((s) => ({
    site: s.site,
    condition: 'No readings in the MPPCB data pack, in any year',
    impact: (s.description || 'Listed for 2026 in news reports with no baseline.') +
      ' It cannot be ranked and is not a clean site: it is an untested one.',
    category: 'Unmonitored site',
  }));

  return [...untested, ...register];
}
