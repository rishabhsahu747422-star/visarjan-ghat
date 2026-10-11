# HANDOFF: state of the repo after A + D were merged (11 Oct 2026)

For the next Claude Code session. Read this, then `docs/TEAM.md` (API contract), `docs/DECISIONS.md`, `docs/PRD.md` section 6 (rules).
Deadline: repo public + submitted by **5:00 PM**. Feature freeze 3:45 PM. Record the 2-minute demo at **4:00 PM**.

## Hard rules (the jury checks these)
Missing is never clean. BDL is not zero. Durga and Ganesh are never pooled (Durga default). LLM only rephrases, never computes. No health claims. "good" recovery means NO WORSE than before immersion, never "clean" or "recovered". Null stays null. No secrets in the repo. Code written after 10:15 AM only.

## What is done (backend: 72 tests pass, `cd backend && python -m pytest -q`)
| Area | State |
|---|---|
| Data loader, classify, Class B limits, golden tests | Done (shared) |
| `scoring.py` (A): phase_table, impact_recovery, confidence, rank_ghats, ghat_detail, test_priority | Done. Independently re-derived from the CSV: all 7 Durga scores match |
| API: /api/health, summary, ghats, ranking, ghat, brief | Done. `/api/ghat` takes `site` as a QUERY param (a site name contains "/") |
| `brief.py` + `prompts.py` (D): template brief, 150-word cap, number validator, optional Groq LLM | Done. Default `LLM_PROVIDER=none` (template). LLM path NOT tested with a real key |
| Frontend: `api.ts` typed to the contract, `App.tsx` ranked list + `Brief` page mounted | Done, `npm run build` passes. This is a plain placeholder UI |

Durga ranking (v0): Bairagarh 0.527 High (Low confidence, latest data 2024), Shahpura 0.402, Rani Kamlapati 0.391, Malikhedi 0.330 (Low conf), Hathaikheda 0.278, Khatlapura 0.215, Prempura 0.075. Arch Bridge ghat = no data. Ganesh has 0 High, 6 Medium, 1 Low.

## Mismatches found between A, D and the docs, and what was done
1. **Unresolved git merge** (`docs/DECISIONS.md` both sides added D-15/D-16). FIXED: A's rows kept as D-15 (recovery wording) and D-16 (test_priority); D's rows renumbered D-17 to D-20; new D-21 added.
2. **Brief said "Back to pre level after"** for ghats still above limits (Bairagarh Durga after-phase BOD is still high). FIXED: `build_facts` splits `good` into `good_above_limits` ("Still above limits after.") / `good_within_limits` ("Within limits after."); LLM prompt updated; 2 tests added.
3. **D's brief ignored A's new `after_severity` / `latest_data_year`.** `after_severity` now used. `latest_data_year` is shown in the UI only, not in the brief.
4. **`App.tsx` still said "Ranking is not built yet"; `Brief.tsx` was never mounted; `api.ts` had `ranking: unknown[]`.** FIXED (typed, mounted).
5. **README status table was stale and contradicted the code.** FIXED. Team name/members placeholders STILL open (below).
6. Docs say Cerebras/Claude; D chose Groq (`openai/gpt-oss-120b`, D-20). Allowed by the rules ("any tools"). Keep Groq out of the repo unless a key is set via env var.
7. CSV files show as modified in `git status` only because of Windows line endings. Do not commit them.

## Still open (in priority order)
The design branch has since been merged onto the live API; see `docs/INTEGRATION.md` for the 22
mismatches found and fixed, and D-24 to D-28 in `docs/DECISIONS.md`. The UI is now the design
branch's screens (React Router, Tailwind, JSX) with every number coming from the API. What is left:

1. **Hindi sign-off by a human.** Every Hindi string in `backend/app/prompts.py` (marked there) and
   `brief.py`. Four new action strings were added (`ACTIONS_HI`) and three existing strings were
   shortened to fit the word cap: `FOOTER_HI`, the Hindi heading ("इन घाटों पर पहले ध्यान:") and the
   Hindi title, which now uses the short festival name. Not machine-checkable. Needed before 3:00 PM.
2. **Fill TEAM NAME and MEMBERS in `README.md`** (line 5). Nothing else in the README is a placeholder.
3. **`docs/FACTCHECK.md` is written but nothing is verified.** Ten rows, two per teammate, every one
   says `checked: no`. Each row names the report, the PDF page and the printed site name. Until this
   is done, do not claim a verified fact check in the demo.
4. **Decide what to do with `data/fixtures/`.** Both files are real snapshots of the live API and
   agree with it, but nothing imports them any more. The 3:45 checklist in `docs/TEAM.md` says
   "fixtures deleted"; delete them or relabel them as contract examples.
5. **`_risk_level(None)` returns "Low"** (`backend/app/scoring.py`). Unreachable today, because a
   ghat with no measured scored data never reaches the ranking, but it is the one place in the code
   where a missing score would read as low risk. One line to harden; A owns the file.
6. **A's 3:15 property test is missing**: "removing a reading never makes a ghat look cleaner".
   `test_unknown_phase_never_zero` and `test_no_zero_measured_ghat_ranked` cover neighbouring
   ground, not the monotonicity property itself.
7. **Optional/stretch**: test the LLM brief once with a real `GROQ_API_KEY` in the environment
   (never in a file) — the Groq path is unit-tested with a fake transport but has never spoken to
   the real API; robustness toggle; map of ghats.

Done in the second session, with notes:
- **Ghat detail page** (`pages/Detail.tsx`, `components/PhaseChart.tsx`, `EvidenceTable.tsx`,
  `QuadrantChart.tsx`): pre/during/after per year per parameter against the Class B line, gaps shown
  as breaks in the line and named in the caption, every reading with "Report {year}, page {n}", raw
  values beside every delta, print stylesheet. Charts are hand-rolled SVG — no chart library.
- **Data and limits page** (`pages/Gaps.tsx`): golden numbers from `/api/summary`, Class B rationale,
  assumed units, the scoring walk-through, every known gap, the no-data sites.
- **Tabs** in `App.tsx` (Ranking, Ghat detail, Brief, Data and limits), no router library; the tab,
  the selected ghat and the festival are mirrored into the URL hash, so `#/detail/<site>?festival=Durga`
  is a deep link (the deep links are listed in `docs/DEMO.md`).
- **Design pass** in `styles.css`: water-toned base, a risk ramp that changes lightness as well as
  hue, dashed outlines plus hatching for anything missing, page fade, button feedback, reduced-motion
  respected, 560 px breakpoint, print rules. Hindi font is bundled via
  `@fontsource/noto-sans-devanagari` (imported in `main.tsx`, no runtime CDN).
- **Brief action line** (D-22): one short action per top ghat, chosen in `brief.py` from computed
  values only, never dropped by the word-cap ladder. Fitting it inside D-18's 150 words needed D-23
  (a new ladder step and the shortened Hindi strings above). Durga and Ganesh both render at detail
  level 2 — readings, quadrant, recovery, confidence and action — at 142/150 EN and 150/150 HI for
  Durga. Hindi has no headroom: if a site name or a reading changes, the ladder drops the quadrant
  phrase, which is the intended behaviour, not a bug.
- One of D's assertions was narrowed: `test_brief_never_says_recovered_and_flags_still_above_limits`
  used to ban the string "clean" outright, which blocked the action "Clean the ghat first." It now
  bans "clean" as a description of the water ("clean water", "is clean", "cleaner", …) and allows it
  as an action for the officer. Worth a second pair of eyes.
- `docs/DEMO.md`: 6-minute walkthrough, the 2-minute cut to record, pre-flight checklist, what to say
  if something breaks, and the questions to expect.
- README: status table rebuilt to match the code, Windows venv line, dev-proxy note, extra data
  sourced and linked.
- `git grep -n -i -E "api_key|gsk_|csk-|sk-ant"` is clean: variable names only, `.env.example` empty.

Checked this session: 78 backend tests pass, `npm run build` passes, every page and component
renders without a React warning against the live payloads, and `/api/ranking`, `/api/ghat`
(including the site name with a "/"), `/api/brief`, `/api/ghats` and the 400/404 paths all answer
correctly. The ranking, evidence, detail and brief payloads match the contract in `docs/TEAM.md`
field for field for both festivals.

## Commands
```
cd backend && python -m pytest -q            # 72 pass
cd backend && uvicorn app.main:app --reload  # http://localhost:8000/api/ranking?festival=Durga
cd frontend && npm install && npm run dev    # http://localhost:5173  (VITE_API_BASE_URL=http://localhost:8000)
cd frontend && npm run build                 # tsc + vite build, must pass
```

## Files and owners
`backend/app/scoring.py`, `main.py`, `tests/test_scoring.py`, `data/fixtures/`: A. `backend/app/brief.py`, `prompts.py`, `tests/test_brief.py`, `frontend/src/pages/Brief.*`: D. Other `frontend/src/*`: B, C. `README.md`, `docs/FACTCHECK.md`, `docs/DEMO.md`: E. Log every weight/threshold/definition change in `docs/DECISIONS.md` (next free number: D-29).
