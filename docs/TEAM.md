# Team plan: who does what

5 people, one product. Each person owns specific files so nobody edits the same file at once. Fill in names first.

| Role | Name | Owns |
|---|---|---|
| A. Data and scoring lead | ______ | `backend/app/scoring.py`, `backend/app/main.py`, `backend/tests/test_scoring.py`, `data/fixtures/` |
| B. Frontend lead (ranking and design) | ______ | `frontend/src/App.tsx`, `frontend/src/pages/Ranking.tsx`, `frontend/src/components/QuadrantChart.tsx`, `frontend/src/styles.css` |
| C. Frontend (detail and gaps) | ______ | `frontend/src/pages/Detail.tsx`, `frontend/src/pages/Gaps.tsx`, `frontend/src/components/PhaseChart.tsx`, `frontend/src/components/EvidenceTable.tsx` |
| D. Brief and Hindi lead | ______ | `backend/app/brief.py`, `backend/app/prompts.py`, `backend/tests/test_brief.py`, `frontend/src/pages/Brief.tsx` |
| E. Fact-check, repo and demo lead | ______ | `docs/FACTCHECK.md`, `docs/DEMO.md`, `README.md`, deployment, CI, final QA |

**Hindi:** whoever is fluent in Hindi reviews every Hindi string. If that is not D, D sends text to that person and waits for approval before 3:00 PM.

## Working rules
- Branch per person: `a/scoring`, `b/ranking`, `c/detail`, `d/brief`, `e/docs`. Merge to `main` through a pull request. E merges.
- Commit small and often. Pull `main` before you start each block.
- Edit only the files you own. Need a change in someone else's file? Message them, do not edit it.
- Never commit API keys. Use environment variables.
- All code in the repo must be written after 10:15 AM.
- Missing data is never clean. BDL is not zero. Durga and Ganesh are never pooled. If you are unsure, read PRD section 6.

## The API contract (frozen at 11:00)
A builds the API to this shape. B, C and D build against it from the fixture, so nobody waits.

### `GET /api/ranking?festival=Durga|Ganesh`
```json
{
  "festival": "Durga",
  "formula_version": "v0",
  "ranking": [
    {
      "rank": 1,
      "site": "Bairagarh (Sant Hirdaram) kund",
      "water_body": "Upper Lake",
      "risk_score": 0.82,
      "risk_level": "High",
      "quadrant": "already_bad",
      "baseline_severity": 0.9,
      "immersion_damage": 0.1,
      "recovery": "poor",
      "after_severity": 0.62,
      "latest_data_year": 2024,
      "confidence": { "level": "Low", "reasons": ["No Durga 2025 table in the report"] },
      "reason": "Plain-words reason built from the numbers below.",
      "bmc_list_2026": "listed",
      "test_priority": 0.7,
      "evidence": [
        { "year": 2023, "phase": "pre", "parameter": "Dissolved oxygen", "value": 0.0,
          "status": "measured", "limit": ">= 5 mg/l", "breach": 1.0, "source_page": 60 }
      ]
    }
  ],
  "no_data_sites": [ { "name": "Arch Bridge ghat", "note": "No baseline, test before use" } ]
}
```
Allowed values: `risk_level` Low | Medium | High · `quadrant` already_bad | damaged_by_immersion | both | stable | unknown · `recovery` good (= no worse than before immersion, NOT clean) | poor (= worse a week later) | unknown · `confidence.level` High | Medium | Low · `status` measured | below_detection | missing. Any score that cannot be computed is `null`, never 0.

### `GET /api/ghat?site=<name>&festival=Durga|Ganesh`
```json
{
  "site": "Bairagarh (Sant Hirdaram) kund",
  "festival": "Durga",
  "readings": [
    { "year": 2023, "phase": "pre", "parameter": "Dissolved oxygen", "value": 0.0, "status": "measured",
      "value_as_printed": "0.0", "limit": ">= 5 mg/l", "breach": 1.0, "source_page": 60 }
  ],
  "impact": [
    { "year": 2023, "parameter": "BOD", "pre": 2.0, "during": 4.8, "after": 6.6,
      "during_minus_pre": 2.8, "after_minus_pre": 4.6 }
  ]
}
```
`source_page` is the PDF page in that year's MPPCB report. Show the year beside it.

### `GET /api/brief?festival=Durga`
```json
{ "festival": "Durga", "en": "...", "hi": "...", "source": "llm", "numbers_validated": true }
```
`source` is `llm` or `template`. If validation fails, return the template version.

---

## A. Data and scoring lead
**Goal:** the ranking and ghat endpoints return real numbers, correctly, with tests.

| By | Task | Done when |
|---|---|---|
| 10:45 | Commit `data/fixtures/ranking_durga.json` and `ghat_bairagarh_durga.json` in the contract shape. Mark each file `"_fixture": true`. Shape only, not real values. | B, C, D can load them |
| 11:00 | Freeze the contract. Any change after this is announced in the group chat. | Message sent |
| 12:00 | `phase_table(festival)`: per ghat, year, parameter, phase values. Use `status`. Missing stays `None`. | Test: a missing value is never converted to 0 |
| 12:30 | `breach` per reading with `limits.breach_severity`, for DO, BOD and pH only. | Test: DO 0 gives 1.0, DO 6 gives 0 |
| 1:15 | `impact_recovery(festival)`: `during - pre` and `after - pre`, only when both values exist, else `None`. | Test: a ghat with `during` only returns `None` |
| 1:45 | `confidence(festival)` with reasons, per PROPOSED_SOLUTION section 4. | Bairagarh and Malikhedi come out Low or Medium with a reason |
| 2:30 | `rank_ghats(festival)`: risk score (during 0.5, after 0.3, pre 0.2, recency 0.5/0.3/0.2), quadrant, evidence rows. Wire `/api/ranking` and `/api/ghat`. | Real output matches the contract; fixture removed |
| 3:15 | Property test: removing a reading never makes a ghat look cleaner. Add the `reason` text template. | Test passes |
| 3:30 | Stretch only if everything above is done: `test_priority`. | Optional |

**Rules:** weights and formulas are v0. Any change goes in `docs/DECISIONS.md` as a new row. Do not call an LLM from scoring code. Ganesh and Durga are computed separately.

## B. Frontend lead (ranking and design)
**Goal:** the first screen the officer and the jury see. It looks finished and reads in seconds.

| By | Task | Done when |
|---|---|---|
| 11:00 | Design pass: replace the placeholder tokens in `styles.css` (colors, type scale, spacing, risk colors that stay readable for colour-blind users). Keep it simple and intentional. | Tokens committed |
| 12:30 | `Ranking.tsx` against the fixture: rank, ghat, risk level, one-line reason, confidence badge, Durga default and Ganesh toggle. | Matches the contract |
| 1:30 | Tabs in `App.tsx` (Ranking, Detail, Brief, Gaps). No router library. Clicking a ghat opens Detail with `site` and `festival`. | Navigation works |
| 2:30 | `QuadrantChart.tsx`: baseline on x, immersion damage on y, one dot per ghat, labelled quadrants. `null` values show as "unknown", never at 0. | Chart renders |
| 3:00 | Swap fixture for the live API. Handle loading, 501 and error states with a clear message. | No console errors |
| 3:30 | Mobile check at 380 px width, keyboard focus, empty states. | Passes the checklist below |

**Rules:** missing data must look different from low risk (grey with a label, not green). Show the confidence badge next to every rank. No health wording anywhere.

## C. Frontend (detail and gaps)
**Goal:** every number can be checked, and every gap is visible.

| By | Task | Done when |
|---|---|---|
| 12:30 | `EvidenceTable.tsx`: readings table with value, limit, breach marker, `value_as_printed`, status, and "Report {year}, page {n}". | Renders the fixture |
| 1:30 | `PhaseChart.tsx`: pre, during, after per year for DO, BOD and pH, with the limit as a reference line. Missing points show as gaps, not zeros. | Chart renders |
| 2:15 | `Detail.tsx`: ghat header with confidence, the chart, the impact table showing raw `pre`, `during`, `after` beside each delta, and the evidence table. | Matches the contract |
| 2:45 | `Gaps.tsx`: static page listing every known gap (see PRD section 6), assumed units, why Class B, ghats with no data, Arch Bridge, the unverified 2026 list. Text must match the PRD. | E reviews |
| 3:15 | Connect to the live `/api/ghat`. Handle loading and error states. | No console errors |
| 3:30 | Print stylesheet for Detail, so the officer can print it. | Prints on one page |

**Rules:** deltas are never shown without the raw values beside them. A `null` impact shows "Not measured at both stages".

## D. Brief and Hindi lead
**Goal:** a short bilingual brief that never contains a number we did not compute.

| By | Task | Done when |
|---|---|---|
| 12:00 | Template brief in `brief.py`: English and Hindi, under 150 words each, built from the ranking JSON. No LLM. | Works offline |
| 1:15 | Validator: every number in the text must appear in the input JSON. If not, fall back to the template. Tests in `test_brief.py`. | Test: an invented number is rejected |
| 2:00 | `prompts.py` and the LLM call (Cerebras or Claude, chosen by `LLM_PROVIDER`). Input is the ranking JSON only. Rules in the prompt: use only given numbers, no health claims, state missing data, keep it short. | LLM brief passes validation |
| 2:30 | Add `/api/brief` in coordination with A (A owns `main.py`, so send A the 5-line route). | Endpoint returns the contract shape |
| 2:45 | `Brief.tsx`: language switch, copy button, print button. | Copy and print work |
| 3:00 | Hindi review by a fluent speaker. Fix wording. | Reviewer signs off in the chat |

**Rules:** the brief says what the readings show against the limits, nothing about health effects. It lists the top ghats, what is bad (DO, BOD, pH), whether immersion worsens it, and which ghats lack data. The demo must work with `LLM_PROVIDER=none`.

## E. Fact-check, repo and demo lead
**Goal:** the numbers are right, the repo is submittable, and the demo cannot fail.

| By | Task | Done when |
|---|---|---|
| 10:45 | Create the GitHub repo (public), push the scaffold, add MIT license, protect `main`. Share the link. | Everyone can push |
| 11:30 | Ask the mentor the open questions in PRD section 11. Record answers in `docs/DECISIONS.md`. | Answers logged |
| 12:00 | Download the three MPPCB PDFs from the sources in `data/DATA_DICTIONARY.md`. Pick 10 readings across ghats, including Bairagarh DO 0, and verify each against its `source_page`. Log them in `docs/FACTCHECK.md` as year, ghat, parameter, phase, CSV value, PDF value, match yes/no. | Table started |
| 1:30 | Deploy the backend to Render and the frontend to Vercel using `docs/DEPLOYMENT.md`. Set `ALLOWED_ORIGINS`. | Both URLs work |
| 3:00 | Check the live site against the FACTCHECK list. Any mismatch goes to A immediately. | All 10 match or are explained |
| 3:15 | Write `docs/DEMO.md`: the 6-minute script (see below). Update the README: team, members, the one user, run steps, the Status table, extra data. | README complete |
| 3:45 | Feature freeze. Run the final checklist. | Checklist passes |
| 4:00 | Record the 2-minute demo. Wake the Render service first by opening `/api/health`. | Recording saved |
| 4:30 | Submit the form with the repo link and the recording. | Confirmation received |

### Demo script (6 minutes)
1. 0:00 The officer and the problem: test results sit in PDFs. Open with "Dissolved oxygen read 0 at Bairagarh."
2. 0:45 The ranked list. Click the top ghat.
3. 1:45 Detail page: readings against limits, source page.
4. 2:45 Impact and recovery: what happens during immersion and after.
5. 3:45 Missing data: show a gap labelled as missing, not clean. Show the confidence badge.
6. 4:30 The brief: switch language, copy.
7. 5:15 Close: what the officer can do this week, and what the tool does not cover.

## Integration checkpoints
| Time | Everyone | Check |
|---|---|---|
| 11:00 | 5 minutes | Contract frozen. Fixtures committed. Everyone knows their files. |
| 1:00 | 5 minutes | Scoring status. Does the fixture still match the contract? |
| 2:30 | 10 minutes | Live API merged. B, C, D switch from the fixture. |
| 3:45 | 10 minutes | Freeze. Only bug fixes after this. |
| 4:30 | 5 minutes | Submit. |

## Blockers
If you are stuck for more than 15 minutes, say so in the group chat. If the scoring slips, B, C and D keep working against the fixture and A ships the simplest honest version (risk score and confidence only, no quadrant). A working simple ranking beats a half-built clever one.

## Final checklist (E runs it at 3:45)
- [ ] Fixtures deleted and the live API is used everywhere
- [ ] `python -m pytest -q` passes in `backend`
- [ ] `npm run build` passes in `frontend`
- [ ] The golden numbers on the Gaps page match the PRD (1,524 rows, 42/116, 100/112)
- [ ] Missing data never appears as low risk anywhere
- [ ] Durga and Ganesh are never mixed in one score
- [ ] No health claims in any text
- [ ] Hindi reviewed by a fluent speaker
- [ ] Works with `LLM_PROVIDER=none`
- [ ] No keys in the repo (`git grep -n "API_KEY"` shows names only)
- [ ] README has team, user, run steps, what works and what does not, extra data with links
- [ ] MIT `LICENSE` present, repo is public
- [ ] Demo recorded, form submitted before 5:00 PM
