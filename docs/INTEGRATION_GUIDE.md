# INTEGRATION GUIDE: merge `frontend` (design) into `main` (tested backend)

For Claude Code. Do the whole job without stopping to ask questions: make a reasonable choice, log it in `docs/DECISIONS.md` (next free number is D-22), and continue. Commit in small steps.

Project: Visarjan Ghat Watch, Track 2, Claude Impact Lab x Cerebras, Bhopal, 11 Oct 2026.
Deadline: repo public and submitted by **5:00 PM**. Feature freeze **3:45 PM**. Demo recording **4:00 PM**.
User of the product: one BMC officer planning Durga visarjan on 20 Oct 2026.

## 0. Read first
`docs/HANDOFF.md`, `docs/TEAM.md` (the API contract), `docs/DECISIONS.md`, `docs/PRD.md` section 6, `frontend/src/api.ts` (typed contract on `main`).

## 1. Situation
- `main`: backend finished and tested (72 pytest pass). Scoring, ranking, `/api/ghat`, brief (template + optional Groq LLM), typed `frontend/src/api.ts`, a plain placeholder UI.
- `frontend` branch: the real design, but design only (probably mock data or hardcoded values).
- Goal: the design runs on the LIVE API, with no mock data left, and every mismatch is found, fixed and written down.

## 2. Hard rules (the jury checks these)
1. Missing data is never clean. `null` shows as "not measured", never as 0 or as passing.
2. BDL = "below detection": very low, not zero, not missing.
3. Durga and Ganesh are never pooled. Durga is the default.
4. The LLM only rephrases; it never computes. The template brief must always work with no key.
5. No health claims in any UI text. Only compare readings with CPCB Class B limits (DO >= 5, BOD <= 3 mg/l, pH 6.5 to 8.5).
6. Recovery wording (D-15, D-21). `good` means "no worse than before immersion", NOT clean:
   - `good` and `after_severity > 0`: "No worse a week later, still above limits"
   - `good` and `after_severity == 0`: "Within limits a week later"
   - `poor`: "Worse a week later"; `unknown`: "After immersion: not measured"
   - Never write "clean", "recovered", "improved", "safe", "good water".
7. Quadrant `stable` = "No clear rise during immersion", never "within limits".
8. No API keys or secrets in the repo. Env vars only. Never commit `.env`.
9. Do not change the backend unless the contract itself is wrong. If it is, change backend + `docs/TEAM.md` + tests together and log it.
10. CSV files show as modified because of Windows line endings. Never commit them.

## 3. Git steps
```
git fetch origin
git checkout main && git pull
git checkout -b integrate
git merge origin/frontend --no-commit      # if histories are unrelated: add --allow-unrelated-histories
git status
```
Conflict rule:
| Path | Take |
|---|---|
| `backend/`, `docs/`, `data/`, `.github/`, `render.yaml`, `.env.example`, `README.md` | `main` |
| `frontend/src/api.ts` | `main` (typed contract). Extend it if the design needs more, never weaken it |
| Everything that is look and feel in `frontend/src/` (components, styles, pages, assets, fonts) | `frontend` |
| `frontend/package.json`, `package-lock.json` | union of dependencies; run `npm install` to regenerate the lock |
| `frontend/src/App.tsx`, `main.tsx` | merge by hand: the design's layout plus the data wiring from `main` (ranking, brief, festival toggle) |

Then `git add -A && git commit`. Work on `integrate`. Do NOT push to `main` until section 6 is green.

## 4. Wire the design to the live API
Use `frontend/src/api.ts` (`api.ranking`, `api.ghat`, `api.brief`, `api.summary`, `api.ghats`). Base URL from `VITE_API_BASE_URL`.
1. Find every mock, fixture, placeholder or hardcoded value in `frontend/src` (grep for `mock`, `fixture`, `dummy`, `lorem`, hardcoded ghat names, hardcoded scores) and replace it with API data.
2. Screens that must exist and work:
   - **Ranked list** (home). Durga/Ganesh toggle, Durga default. For each ghat: rank, site, risk level, `reason`, confidence level and reasons, quadrant text, recovery text (rule 6), `latest_data_year`. A separate "No data" group from `no_data_sites` (Arch Bridge ghat is one). Never rank a no-data ghat.
   - **Ghat detail**. Click a ghat, call `api.ghat(site, festival)`. Show pre/during/after by year for DO, BOD, pH against the Class B limit line. Missing is a gap, not 0. Raw values beside deltas. Every number shows year and `source_page`.
   - **Brief**. EN / HI / both toggle, Copy and Print buttons. Show `source` (llm or template) and `numbers_validated`.
   - **Data and limits**. Honest-limits list from the README ("Limits we state openly"), Class B rationale, units assumed, the golden numbers from `/api/summary` (42 of 116 DO below 5, 100 of 112 BOD above 3), `no_data_sites`.
3. `/api/ghat` takes `site` as a QUERY parameter and it must be URL-encoded. One site name contains a slash: "Rani Kamlapati ghat / Kamla Park kund". Never put the site in the path.
4. Every fetch has loading, error ("Cannot reach the API...") and empty states. Nothing crashes when the API is down.
5. Hindi font bundled locally (`@fontsource/noto-sans-devanagari`), not a runtime CDN.
6. Keep the design branch's look. Only change visuals where needed to show the required information. Smooth transitions and button feedback stay, no heavy animation.

## 5. Mismatch checklist (find each one, fix it, record it)
Check every item and write the result in `docs/INTEGRATION.md`.
- [ ] Field names and shapes: the UI vs `RankedGhat`, `GhatDetail`, `BriefResponse` in `api.ts` and `docs/TEAM.md` (snake_case; `confidence` is an object `{level, reasons}`; `risk_score`, `after_severity`, `test_priority` can be `null`).
- [ ] Enum values the design may not know: `risk_level` Low/Medium/High; `quadrant` already_bad/damaged_by_immersion/both/stable/unknown; `recovery` good/poor/unknown; `status` measured/below_detection/missing.
- [ ] Any place that renders `null` as 0, "OK", green or "clean".
- [ ] Any design copy that says clean, safe, healthy, recovered, improved, or makes a health claim.
- [ ] Risk colours: the design's colour scale vs the three real levels; Low confidence must be visible beside the rank.
- [ ] Bairagarh (rank 1 for Durga) must show Low confidence and "latest data 2024". Malikhedi also Low.
- [ ] Number of ghats: 7 ranked per festival plus no-data ghats listed separately.
- [ ] Ganesh toggle refetches and never reuses Durga data.
- [ ] URL-encoding of site names (slash, parentheses, spaces).
- [ ] CORS: `ALLOWED_ORIGINS` and the `*.vercel.app` regex in `backend/app/main.py` work for the deployed frontend URL.
- [ ] `VITE_API_BASE_URL` is set for production in Vercel config and documented in `docs/DEPLOYMENT.md`.
- [ ] Brief words: EN and HI each at most 150 words (D-18). Hindi renders with the bundled font.
- [ ] `README.md` status table and "how to run" (5 steps or fewer) are still true. Team name and members are placeholders: leave `TODO` markers for the user.
- [ ] No secrets: `git grep -n -i -E "gsk_|csk-|sk-ant|api_key"` should only match empty `.env.example` values and `GROQ_API_KEY` env reads.

## 6. Checks to write and run (all must pass before merging to `main`)
1. `scripts/smoke.py`: takes `API_URL` (default http://localhost:8000). For Durga and Ganesh: GET `/api/health`, `/api/summary`, `/api/ghats`, `/api/ranking`, `/api/ghat?site=<each of the 7>`, `/api/brief`. Assert 200, required fields, 7 ranked ghats, `no_data_sites` non-empty, `confidence.level` present, brief `en` and `hi` non-empty with `numbers_validated` true. Assert 400 for `festival=Foo` and 404 for an unknown site. Exit non-zero on any failure.
2. Frontend tests (Vitest + Testing Library, or Playwright if quick), API mocked with real fixture JSON from `data/fixtures/`:
   - ranking renders 7 ghats in rank order; Arch Bridge appears under "No data"
   - Bairagarh shows Low confidence and latest data 2024
   - a `null` reading renders "not measured", not 0
   - recovery `good` with `after_severity > 0` renders "still above limits"
   - detail page opens for "Rani Kamlapati ghat / Kamla Park kund" (encoded URL works)
   - brief toggles EN / HI
3. Run all of these and fix what fails:
```
cd backend && python -m pytest -q                      # 72+ pass
cd backend && uvicorn app.main:app --port 8000 &       # then:
API_URL=http://localhost:8000 python scripts/smoke.py
cd frontend && npm install && npm run build            # tsc strict + vite build must pass
cd frontend && npm test                                # frontend tests
```

## 7. Deliverables
- Branch `integrate`, small commits, building and tests green.
- `docs/INTEGRATION.md`: a table of every mismatch (what, where, fix, status), the exact commands to run all checks, and what is still open.
- `docs/DECISIONS.md` rows for any behaviour change.
- Update the README status table honestly.
- Final message: list what passed, what failed, what is still open, in under 15 lines.

## 8. Stop conditions
- If the merge becomes unmanageable (more than about 30 conflicts), stop merging. Instead copy the design components from `origin/frontend` into `main`'s `frontend/src` one at a time, keeping `api.ts` from `main`. Log it.
- If integration is not green by about 3:15 PM, say so clearly. The fallback is to ship `main`'s current UI (ranked list plus brief, already working). Never push a half-merged state to `main`.
- When green: `git checkout main && git merge integrate`, then tell the user to push and deploy (Render for the API, Vercel for the frontend with `VITE_API_BASE_URL` set to the Render URL).
