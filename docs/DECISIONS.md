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
| D-15 | Brief quotes, per top ghat, the worst DO / BOD / pH reading across all years (ties go to the latest year); readings within limits are not listed; BDL says "below detection", missing says "not measured" | Keeps the headline reading (Bairagarh DO 0, 2023) in the brief and never lists an in-limit value as a problem. | Final |
| D-16 | Brief is capped at 150 words per language including the footer; when over, the template drops detail in a fixed order (confidence reasons, then the thin-data line, then quadrant/recovery phrases), same level for both languages. Top 3 ghats and no-data sites are never dropped | Meets the word cap without hiding a ghat or a data gap. | Final |
| D-17 | Quadrant `stable` is phrased "No clear rise during immersion", never "within limits"; recovery `good` is "Back to pre level after" | `stable` ghats can still breach limits (Malikhedi Ganesh BOD 16.8); D-11 "good" only means after ≈ pre. | Final |
| D-18 | Brief LLM is an open-weight model on Groq (`openai/gpt-oss-120b` by default, `GROQ_MODEL` to change, `LLM_PROVIDER=groq`) instead of Cerebras or Claude | Free tier, open weights. The LLM only rephrases; the validator and template fallback are unchanged, and `LLM_PROVIDER=none` stays the demo default. | Final |

Add a row for every change to weights, limits or definitions.

