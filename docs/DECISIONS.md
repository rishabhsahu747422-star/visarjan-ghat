# Decisions log

| ID | Decision | Why | Status |
|---|---|---|---|
| D-01 | Track 2 only | One workflow, one user, one outcome. Visual, urgent, deterministic scoring. | Final |
| D-02 | CPCB Class B (outdoor bathing) as the reference | Immersion ghats are in direct contact with people. Suggested by the problem guide. | Confirm with mentor |
| D-03 | Missing is never clean; BDL is not zero | Required by the problem statement and the jury. | Final |
| D-04 | Durga and Ganesh never pooled; Durga is the default view | Durga is the coming festival. Coverage differs between them. | Final |
| D-05 | Rule-based scoring, no ML | Explainable, traceable, small data. | Final |
| D-06 | LLM only rephrases computed numbers; template fallback | Prevents invented values and demo failure. | Final |
| D-07 | Treat impact as indicative | Few readings per ghat. Show raw values beside deltas. | Final |
| D-08 | `ghat_meta.json` 2026 list from news, flagged unverified | NGT ban context. Not an official order. | Confirm with mentor |
| D-09 | Backend on Render, frontend on Vercel | Python and pandas on the API, static React on the edge. | Final |
| D-10 | Statewide CSV not included | Background only and less checked. Add later if needed. | Open |
| D-11 | Recovery: good if after_severity ≤ pre_severity + 0.05, poor otherwise, unknown if either missing | Small tolerance avoids marking near-identical readings as 'poor'. Severity computed over matched parameters (both after and pre measured). | Final |
| D-12 | Risk-level thresholds: High ≥ 0.50, Medium ≥ 0.25, Low < 0.25 | Durga scores: 0.53, 0.40, 0.39, 0.33, 0.28, 0.22, 0.07. Bands give 1 High, 4 Medium, 2 Low — clear separation. | Final |
| D-13 | during-pre, after-pre, and quadrant y computed only over parameters present in both phases | Ensures apples-to-apples comparison. A parameter measured only at one phase does not distort the delta. | Final |
| D-14 | "Latest year" = latest year in dataset for that festival, not per-ghat | Bairagarh / Malikhedi Durga → Low confidence because 2025 is missing dataset-wide. | Final |

Add a row for every change to weights, limits or definitions.

