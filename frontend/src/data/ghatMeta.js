/**
 * Display copy and the published limits. NO NUMBER ON SCREEN COMES FROM THIS FILE.
 *
 * Risk scores, confidence, quadrants, water bodies and the BMC 2026 label all come from the
 * API (see dataService.js). What is left here is prose that describes where a ghat is, plus
 * the CPCB Class B limits, which are shown as reference text and mirror backend/app/limits.py.
 * If limits.py changes, change these too and log it in docs/DECISIONS.md.
 */

/** Where the ghat is, in plain words. No claim about its water, past or present. */
export const GHAT_DESCRIPTIONS = {
  'Bairagarh (Sant Hirdaram) kund':
    'Immersion kund on the western shore of Upper Lake, at Bairagarh (Sant Hirdaram Nagar).',
  'Malikhedi kund':
    'Built immersion kund in eastern Bhopal, kept separate from the lakes themselves.',
  'Prempura ghat':
    'Long-used immersion ghat on the southern edge of Upper Lake (Bhojtal), with a concrete ramp.',
  'Khatlapura ghat':
    'Main immersion ghat on Lower Lake near Jahangirabad, with a large urban catchment behind it.',
  'Hathaikheda dam / kund':
    'Immersion kund and reservoir embankment on the eastern edge of Bhopal.',
  'Rani Kamlapati ghat / Kamla Park kund':
    'Lower Lake embankment beside Kamla Park and the Rani Kamlapati palace. The reports may be describing two adjoining spots, so the site match is only Medium.',
  'Shahpura lake ghat':
    'Urban lake ghat in south Bhopal, surrounded by housing and shops.',
  'Arch Bridge ghat':
    'Named for 2026 immersion in news reports, with no readings in the MPPCB data pack.',
};

/** CPCB Class B (outdoor bathing). Mirrors backend/app/limits.py. */
export const CPCB_LIMITS = {
  'Dissolved oxygen': {
    min: 5.0,
    unit: 'mg/l',
    standard: 'CPCB Class B (outdoor bathing)',
    desc: 'Oxygen dissolved in the water. Class B expects 5 mg/l or more.',
  },
  BOD: {
    max: 3.0,
    unit: 'mg/l',
    standard: 'CPCB Class B (outdoor bathing)',
    desc: 'Biochemical oxygen demand: how much oxygen the organic load in the water consumes. Class B expects 3 mg/l or less.',
  },
  pH: {
    min: 6.5,
    max: 8.5,
    unit: 'pH units',
    standard: 'CPCB Class B (outdoor bathing)',
    desc: 'Acidity or alkalinity. Class B expects 6.5 to 8.5.',
  },
};

/** Reported by MPPCB but with no Class B limit: context only, never counted as a breach. */
export const CONTEXT_PARAMETERS = [
  'COD', 'Total solids', 'Dissolved solids', 'Suspended solids', 'Turbidity',
  'Conductivity', 'Chromium', 'Lead', 'Zinc', 'Copper',
];

/** Provenance of the 2026 ghat list. Shown wherever the BMC 2026 label appears. */
export const BMC_LIST_NOTE =
  'The 2026 ghat list comes from news reports (Free Press Journal and The Hitavada, 26 Feb 2026). It is not an official BMC order and is unverified.';
