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

Add a row for every change to weights, limits or definitions.
