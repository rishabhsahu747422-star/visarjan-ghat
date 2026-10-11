# Integration: design branch onto the live API

What `origin/frontend` (the design) and `main` (the tested backend) disagreed about, what was
done about each one, and how to re-run every check. Follows `docs/INTEGRATION_GUIDE.md`.

Merged on branch `integrate`. Result: the design is intact, and no number on screen is computed
in the browser.

## The headline

The design branch shipped its own scoring. `src/data/bhopal_readings.json` was a 710 KB copy of
the readings, and `utils/calculations.js`, `utils/confidence.js` and `utils/briefGenerator.js`
recomputed breach severity, risk scores, confidence, quadrants and the brief in the browser.

Those files are deleted. `src/data/dataService.js` is now an adapter over `src/api.ts`: it fetches
`/api/ranking`, `/api/ghat`, `/api/summary` and `/api/brief` and renames fields into the shape the
design components already read. Two implementations of the risk score would drift, and the claim
the jury is checking is that every number traces to one formula and one report page.

## Mismatches found and fixed

| # | What | Where | Fix | Status |
|---|---|---|---|---|
| 1 | Scoring duplicated in the browser from a bundled CSV | `data/bhopal_readings.json`, `utils/calculations.js`, `utils/confidence.js` | Deleted. All numbers now come from the API via `dataService.js` (D-24) | Fixed |
| 2 | The brief was written in the browser, with its own sentences and numbers, no word cap and no validation | `utils/briefGenerator.js`, `pages/OfficialBriefPage.jsx` | Deleted. The page renders `GET /api/brief` verbatim and shows its `source` and `numbers_validated` | Fixed |
| 3 | Risk badge used its own thresholds (65 / 40 / 20 on a 0-100 score), which disagree with D-12 (0.50 / 0.25) | `utils/formatters.js` | `getRiskLevelBadge` now takes the API's `risk_level` string. Bairagarh Durga scores 53 of 100 and is High, as the API says; the old rule would have shown "Elevated" | Fixed (D-25) |
| 4 | Field names and case: the design used `riskScore`, `baselineSeverity`, `siteMeta`; the API returns `risk_score`, `baseline_severity`, snake_case throughout | `data/dataService.js` | Mapped in one place, in `mapRankedGhat` | Fixed |
| 5 | Quadrant was a display string (`'Already Poor'`, `'Combined Concern'`) and the chart compared against it | `charts/ImpactQuadrant.jsx` | Dot colour now keys off the API enum (`quadrantKey`), so renaming a label cannot silently change what a dot means | Fixed |
| 6 | Quadrant `stable` had no wording rule; the design called the quadrant "Lower Observed Impact" | `data/dataService.js` | Mapped to "No clear rise during immersion", never "within limits" (D-19) | Fixed |
| 7 | No recovery wording anywhere. The design showed a recovery delta as a percentage with a green tint and nothing else | `tables/RankingsTable.jsx`, `pages/GhatDetailPage.jsx` | Every row and the detail header now carry the D-15 / D-21 wording: "No worse a week later, still above limits" when `after_severity > 0` | Fixed |
| 8 | Ghats with no readings were rows in the ranking table with `rank: null` and a dash | `dataService.js`, `pages/RankingsPage.jsx` | Split: `ghatsAnalysis` is ranked ghats only, `noDataGhats` is separate and renders in its own block with the reason. Scoring a gap is a guess (PRD s6) | Fixed |
| 9 | `confidence.badgeClass` (a Tailwind class) was baked into the data layer | `dataService.js` | Dropped. The data layer carries `{level, reasons}` from the API; styling stays in `ConfidenceBadge` | Fixed |
| 10 | Golden numbers were typed into the markup: 1,524 / 42 of 116 / 100 of 112 in four places | `LandingPage`, `AtlasRail`, `Footer`, `OverviewPage` | All read from `/api/summary`. They happened to be right, but a hardcoded number cannot stay right | Fixed |
| 11 | The readings table used `r.unit_assumed` and `r.flag`, which `/api/ghat` does not return, so the value column was blank for every non-measured row | `tables/EvidenceTimeline.jsx` | Rewritten to use `status`, `limit`, `breach` and `value_as_printed`. Added a Class B limit column and a past-limit marker | Fixed |
| 12 | Missing and below-detection rows rendered as "Not sampled" / "BDL (Low)" with no value, which reads like an empty cell | `EvidenceTimeline`, `utils/formatters.js` | Now "Not measured" and "Below detection" in words, in both the value cell and the status chip. Never a 0 | Fixed |
| 13 | Copy called water clean: "Clean baseline · Spikes during event", "Clean bathing water must not exceed 3.0 mg/l" | `ImpactQuadrant`, `MethodologyPage` | Reworded. "Clean" never describes the water anywhere in the UI | Fixed |
| 14 | Clinical wording: "hypoxia", "hypoxic shock", "asphyxiation risk" in five places | `ImpactQuadrant`, `LandingPage`, `MethodologyPage`, `OverviewPage`, `ghatMeta.js` | Reworded to state the reading against the limit. No health claims (PRD s5) | Fixed |
| 15 | Reason text was generated in the browser and included a percentage, e.g. "Baseline hypoxia ... (50% breach)" | `dataService.js` | Gone. The API's factual `reason` is shown instead, on the ranking row and the detail header | Fixed |
| 16 | Coverage matrix hardcoded year 2025 and read the bundled CSV | `charts/CoverageHeatmap.jsx` | Fetches `/api/ghat` per ranked ghat and uses the latest year present in the data | Fixed |
| 17 | Missing-data register was a hardcoded list including Arch Bridge | `tables/MissingDataRegister.jsx` | The untested-site rows come from the API's `no_data_sites`; the rest is static text matched to PRD section 6 | Fixed |
| 18 | No loading or error states: every screen assumed data was already there | `FestivalContext` and all five pages | Loading and error states everywhere. API down shows "Cannot reach the API..." and nothing crashes | Fixed |
| 19 | Switching festival could leave the previous festival's rows on screen during the fetch | `FestivalContext` | The list is cleared before each fetch, so Durga numbers can never appear on a Ganesh screen (D-04) | Fixed |
| 20 | Fonts came from the Google Fonts CDN at runtime | `index.html`, `main.jsx` | Bundled via `@fontsource` (Plus Jakarta Sans, Newsreader, JetBrains Mono, Noto Sans Devanagari). The demo renders the same with no network, and Hindi always has Devanagari | Fixed |
| 21 | `vite.config.js` from the design had no `/api` dev proxy; `tsconfig.json` was deleted with the rest of the TypeScript | `vite.config.js`, `tsconfig.json` | Proxy restored from `main`. `tsconfig` restored and narrowed to `src/**/*.ts(x)`, so `npm run build` still type-checks `src/api.ts` against the contract | Fixed |
| 22 | Two risk vocabularies: the API has three levels, the design had four labels | `utils/formatters.js` | High to "High Concern", Medium to "Elevated Risk", Low to "Lower Observed Risk", no level to "Not scored". The fourth band is gone | Fixed |

## Two derived display figures

The adapter does arithmetic in exactly two places, both on values the API already computed, both
marked `DERIVED` in `src/data/dataService.js`:

1. **`duringSeverity` = `baseline_severity` + `immersion_damage`.** The API publishes the
   pre-immersion severity and the rise during immersion, not the during severity itself. Used only
   in the three-phase card on the detail page.
2. **`recoveryDelta` = `after_severity` − `baseline_severity`.** Shown beside the recovery wording,
   never instead of it. The wording, which comes from the API's `recovery` and `after_severity`,
   is what states whether the water is still above the limits.

Neither touches a raw reading. If either becomes load-bearing, move it into `scoring.py` and add a
test there.

## Checklist from the guide, section 5

- [x] Field names and shapes match `api.ts` and `docs/TEAM.md`
- [x] Enum values handled: `risk_level`, `quadrant`, `recovery`, `status`, `confidence.level`
- [x] No place renders `null` as 0, "OK", green or clean
- [x] No copy says clean, safe, healthy, recovered or improved of the water, and no health claims
- [x] Risk colours map to the three API levels; the confidence badge is beside every rank
- [x] Bairagarh Durga shows Low confidence and "latest data 2024"; Malikhedi also Low
- [x] 7 ranked ghats per festival, untested sites listed separately
- [x] Ganesh toggle refetches and never reuses Durga data
- [x] Site names URL-encoded, including the one containing a slash (covered by a test)
- [x] CORS: `ALLOWED_ORIGINS` plus the `*.vercel.app` regex, unchanged in `backend/app/main.py`
- [x] `VITE_API_BASE_URL` documented in `docs/DEPLOYMENT.md` and `frontend/.env.example`
- [x] Brief under 150 words per language, Hindi in the bundled font (both asserted in `scripts/smoke.py`)
- [x] README status table and run steps are current
- [x] No secrets: `git grep -n -i -E "gsk_|csk-|sk-ant|api_key"` matches variable names and an empty `.env.example` only

## How to run every check

```bash
cd backend && python -m pytest -q                       # 78 pass
cd backend && uvicorn app.main:app --port 8000          # leave running, then:
API_URL=http://localhost:8000 python scripts/smoke.py   # 6447 assertions, 0 failures
cd frontend && npm install && npm run build             # tsc --noEmit + vite build
cd frontend && npm test                                 # 11 tests (vitest + Testing Library)
```

CI runs all four on every push (`.github/workflows/ci.yml`).

`scripts/smoke.py` checks the live API: the golden numbers, every enum value, that a measured row
always has a value and a below-detection row never does, that a delta is null whenever either side
is missing, that every ranked ghat's detail page opens, that a name with a slash round-trips, that
both briefs are under 150 words with validated numbers and real Devanagari, and that Durga and
Ganesh are not returning the same scores.

The frontend tests run against `data/fixtures/`, which are real snapshots of the live API.

## Still open

1. **Hindi sign-off by a fluent speaker.** `backend/app/prompts.py` and `brief.py`. The brief page
   now shows that text directly, so an error there is visible to the officer.
2. **Team name and members** in `README.md`, line 5.
3. **`docs/FACTCHECK.md`**: ten readings written up, none verified against the PDFs yet.
4. **Hindi in the UI chrome.** Only the brief is bilingual; the navigation, tables and headings are
   English. The font is bundled, so this is a translation job, not a technical one.
5. **Bundle size.** The main chunk is about 815 KB (231 KB gzipped), mostly recharts and
   framer-motion. Fine for a demo, worth code-splitting later.
6. `_risk_level(None)` in `scoring.py` returns `"Low"`. Unreachable today, but it is the one line
   where a missing score could read as low risk.
7. The LLM brief path has never run against a real `GROQ_API_KEY`. The demo default is
   `LLM_PROVIDER=none`, which is the tested path.
