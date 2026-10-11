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
1. **Ghat detail page** (owners B, C): click a ranked ghat, call `api.ghat(site, festival)`, show pre/during/after by year against the Class B limit line for DO, BOD, pH. Missing = gap, not 0. Every number shows year + `source_page`. Raw values beside deltas. Components planned: `QuadrantChart`, `PhaseChart`, `EvidenceTable` in `frontend/src/components/`.
2. **Data and limits page**: the honest-limits list (README "Limits we state openly"), Class B rationale, units assumed, `/api/summary` golden numbers, `no_data_sites`.
3. **Design pass**: current UI is plain. Wanted: distinctive, deliberate colour (water-toned base, calm-to-alarming risk ramp, not flat white), smooth page transitions and button feedback, restrained animation. Hindi font via `@fontsource/noto-sans-devanagari` (no runtime CDN). Readable on a projector and a phone.
4. **Hindi sign-off by a human**: every string in `backend/app/prompts.py` (marked there) and `brief.py`. Not machine-checkable. Needed before 3:00 PM.
5. **Brief has no action line.** The officer decides cleaning, aeration, testing. Add one short line per top ghat (e.g. extra testing during immersion for Low confidence, use `test_priority`), keep under the 150-word cap (D-18), add the Hindi, keep numbers validated.
6. **`docs/FACTCHECK.md` and `docs/DEMO.md` do not exist.** FACTCHECK: 10 numbers (ghat, year, phase, parameter, value, source_page, "checked: no") split among teammates to verify in `resources/` PDFs. DEMO: 6-minute script (problem, officer, ranked list, one ghat with source page, brief in Hindi/English, honest gaps).
7. **README**: fill TEAM NAME and MEMBERS; confirm "how to run" still works in 5 steps; list extra data used (Free Press Journal / Hitavada ghat list is in `data/ghat_meta.json`, unverified).
8. **Optional/stretch**: test the LLM brief once with a real `GROQ_API_KEY` set in the environment (never in a file); robustness toggle; map of ghats.
9. Run `git grep -n -i -E "api_key|gsk_|csk-|sk-ant"` before the final push. Only `.env.example` with empty values may match.

## Commands
```
cd backend && python -m pytest -q            # 72 pass
cd backend && uvicorn app.main:app --reload  # http://localhost:8000/api/ranking?festival=Durga
cd frontend && npm install && npm run dev    # http://localhost:5173  (VITE_API_BASE_URL=http://localhost:8000)
cd frontend && npm run build                 # tsc + vite build, must pass
```

## Files and owners
`backend/app/scoring.py`, `main.py`, `tests/test_scoring.py`, `data/fixtures/`: A. `backend/app/brief.py`, `prompts.py`, `tests/test_brief.py`, `frontend/src/pages/Brief.*`: D. Other `frontend/src/*`: B, C. `README.md`, `docs/FACTCHECK.md`, `docs/DEMO.md`: E. Log every weight/threshold/definition change in `docs/DECISIONS.md` (next free number: D-22).
