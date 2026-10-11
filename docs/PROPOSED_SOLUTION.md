# Proposed solution

## 1. Idea in one line
Rank ghats by what immersion does to the water and whether it recovers, not only by how dirty it is, and say how much we trust each rank.

## 2. Why this beats a plain risk ranking
A raw-pollution ranking cannot tell the officer what to do. The data has three phases, which lets us separate two different problems:
- **Baseline pollution:** bad before immersion starts (Bairagarh read DO 0 at `pre` in Durga 2023). Needs cleaning and monitoring.
- **Immersion damage:** worse during immersion. Across comparable rows, DO fell in 31 of 38 and BOD rose in 30 of 36. Needs aeration, capacity limits or extra testing during the event.
- **Poor recovery:** still worse one week later (`after` vs `pre`). Needs follow-up testing.

## 3. Architecture
```
data/*.csv  ->  backend (FastAPI + pandas)  ->  JSON API  ->  frontend (React + Vite)
                  | load + classify             /api/ranking   ranked list, ghat detail,
                  | score + impact + confidence /api/ghats     brief, gaps panel
                  | brief (LLM or template)     /api/summary
```
- **Backend (Render):** deterministic scoring. The LLM never computes numbers.
- **Frontend (Vercel):** static React app calling the API via `VITE_API_BASE_URL`.
- **LLM (Cerebras or Claude):** rephrases computed values into reasons and the Hindi and English brief. Optional, with a template fallback.

## 4. Scoring design (v0, tune and record changes in DECISIONS.md)
Computed per ghat, per festival, over the years that have data.

1. **Status:** each reading is `measured`, `below_detection` or `missing`.
2. **Breach severity (0 to 1)** per reading, from `limits.py`: DO `(5 - v) / 5`, BOD `(v - 3) / 3`, pH distance outside 6.5 to 8.5. Within limit is 0.
3. **Phase severity:** mean breach severity across DO, BOD and pH for each phase, using measured values only. A phase with no measured values is "unknown", never 0.
4. **Risk score:** weighted phase severity (during 0.5, after 0.3, pre 0.2), then recency-weighted across years (latest 0.5, previous 0.3, oldest 0.2, renormalised over years that exist).
5. **Impact:** `during - pre` per parameter, only when both exist. **Recovery:** `after - pre`, same rule.
6. **Quadrant:** x = baseline (pre severity), y = immersion damage (positive part of during minus pre severity). Labels: already bad, damaged by immersion, both, stable.
7. **Confidence:** High if DO, BOD and pH have all three phases in the latest two years of that festival. Medium if some phases are missing. Low if the latest year is missing or `during` only. Site match `medium` caps at Medium.
8. **Test priority (stretch):** risk score times a data-gap factor from confidence.

Every output row carries `source_page` values and the contributing readings.

## 5. API (v0)
| Endpoint | Status | Purpose |
|---|---|---|
| `GET /api/health` | done | Liveness for Render |
| `GET /api/summary` | done | Golden numbers, limits |
| `GET /api/ghats` | done | Ghats, water body, match confidence, 2026 list flag |
| `GET /api/ranking?festival=` | TODO (501) | Ranked list with impact, recovery, confidence, sources |
| `GET /api/ghat/{site}?festival=` | TODO | Readings by phase and year with source pages |
| `GET /api/brief?festival=&lang=` | TODO | Hindi and English brief |

## 6. Screens
1. **Ranked list:** Durga | Ganesh toggle (Durga default), rank, ghat, risk level, reason, confidence badge.
2. **Ghat detail:** phase by year chart against limits, raw values beside deltas, source page links.
3. **Brief:** Hindi and English one-pager, copy and print.
4. **Gaps and limits:** missing tables, assumed units, Class B rationale, no health claims, ghats with no data.

## 7. Brief generation
Input is the computed ranking JSON. Prompt rules: use only given numbers, no health claims, state missing data, keep under 150 words per language. Output is validated: every number in the text must appear in the input JSON, otherwise fall back to the template.

## 8. Testing
- Golden tests on the dataset (done).
- Unit tests for classification, severity, impact and recovery with missing values, confidence rules.
- Property test: removing a reading never makes a ghat look cleaner.
- Manual fact-check: 10 numbers against the PDFs, logged in `docs/FACTCHECK.md`.

## 9. Known limits (shown in the product)
Small samples per ghat. Units assumed. Past readings only, not a forecast. Kamla Park may be two sites. New BMC ghats have no data. No health claims.
