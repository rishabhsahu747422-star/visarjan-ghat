# Visarjan Ghat Watch

**Track 2, Claude Impact Lab x Cerebras Café Compute, Bhopal, 11 Oct 2026**

Team: **_TEAM NAME — FILL THIS IN BEFORE SUBMITTING_** · Members: _NAME 1, NAME 2, NAME 3, NAME 4, NAME 5_

## The one user
A Bhopal Municipal Corporation officer planning Durga visarjan (20 Oct 2026) at the ghats. They decide where to send cleaning, aeration and extra water testing.

## What it does
Ranks Bhopal's immersion ghats by water-quality risk against CPCB Class B limits, using three years of MPPCB readings (2023 to 2025). For each ghat it shows:
- a plain-words reason for the rank,
- what immersion does to the water (`during` vs `pre`) and whether it recovers (`after` vs `pre`),
- a confidence level, with missing data shown as missing,
- the report page behind every number,
- a short Hindi and English brief the officer can forward.

Details: [PRD](docs/PRD.md) · [Proposed solution](docs/PROPOSED_SOLUTION.md) · [Decisions](docs/DECISIONS.md) · [Integration](docs/INTEGRATION.md) · [Fact check](docs/FACTCHECK.md) · [Demo script](docs/DEMO.md) · [Deployment](docs/DEPLOYMENT.md)

## Run it (5 steps)
```bash
# 1. Backend
cd backend && python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
# 2.
pip install -r requirements-dev.txt && python -m pytest -q        # 78 tests pass
# 3.
uvicorn app.main:app --reload --port 8000
# 4. Frontend (new terminal)
cd frontend && npm install && npm run dev
# 5. Open http://localhost:5173
```
Checks: `cd frontend && npm test` (UI), and with the backend running,
`API_URL=http://localhost:8000 python scripts/smoke.py` (live API).
The dev server proxies `/api` to port 8000, so no configuration is needed locally. Copy `.env.example` to `backend/.env` only if you want an LLM-written brief. Without keys the app uses a template brief, which is what the demo runs.

## Status
| Works | Not yet |
|---|---|
| Data loading and row classification (measured, below detection, missing) | Native-speaker sign-off on the Hindi strings in `backend/app/prompts.py` and `brief.py` |
| Golden tests reproducing the problem-statement numbers | The ten readings in `docs/FACTCHECK.md` verified against the PDFs (table is written, nothing checked yet) |
| Class B limits and breach severity | Hindi in the UI chrome: only the brief is bilingual, the rest of the interface is English |
| Ranking per festival with reason, confidence, impact, recovery, test priority and source pages | LLM-written brief tested with a real key (template brief is the default and the demo path) |
| API: health, summary, ghats, ranking, ghat detail, brief | Robustness toggle (re-rank under alternative limits) |
| Bilingual brief (template + number-validated optional LLM), 150-word cap, one action per top ghat | Map of the ghats |
| UI: landing page, overview, ranked list with quadrant chart, ghat detail with phase charts and every source page, brief, methodology | Team name and members in this README |
| Every number in the UI comes from the API; no scoring runs in the browser (`docs/INTEGRATION.md`) | |
| Missing data shown as a gap everywhere, never as 0 and never as low risk | |
| 78 backend tests, 6,447 live-API assertions (`scripts/smoke.py`), 11 frontend tests, clean build | |
| Deploy config for Render and Vercel | |

"Back to pre level" is never shown as clean: a ghat whose water is no worse a week later can still be above the limits (DECISIONS D-15, D-21).

_Update this table before submitting. Honesty scores better than a hidden gap._

## Data
All data is public and comes from the participant pack ([Laaaaksh/bhopal-impact-lab-2026](https://github.com/Laaaaksh/bhopal-impact-lab-2026)) built from MPPCB visarjan reports 2023 to 2025 and CPCB water-quality criteria.
- `data/bhopal_ghats_2023_2025.csv`, `data/sample_bhopal_2025.csv`, `data/cpcb_water_quality_criteria.csv`, `data/DATA_DICTIONARY.md`: from the pack.
- `data/ghat_meta.json`: our own working list of ghats named for 2026 immersion, from [Free Press Journal](https://www.freepressjournal.in/) and [The Hitavada](https://www.thehitavada.com/), 26 Feb 2026. **Unverified, not an official order.** It only adds the `bmc_list_2026` label and the Arch Bridge "no data" entry; it never changes a score.

No other outside data is used. Nothing here is personal data.

## Limits we state openly
- The reports print no units. We use the standard unit for each test.
- Few readings per ghat, so impact figures are indicative, not statistical.
- Bairagarh and Malikhedi have no Durga 2025 table. Rani Kamlapati / Kamla Park may be two places.
- The new BMC ghats have no data.
- Past readings only, not a forecast. We make no health claims.

## Deploy
Backend on Render (`render.yaml`), frontend on Vercel (`frontend/vercel.json`). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## License
MIT. See [LICENSE](LICENSE).
