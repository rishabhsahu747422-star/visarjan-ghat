# Visarjan Ghat Watch

**Track 2, Claude Impact Lab x Cerebras Café Compute, Bhopal, 11 Oct 2026**

Team: _TEAM NAME_ · Members: _NAME 1, NAME 2, NAME 3, NAME 4, NAME 5_

## The one user
A Bhopal Municipal Corporation officer planning Durga visarjan (20 Oct 2026) at the ghats. They decide where to send cleaning, aeration and extra water testing.

## What it does
Ranks Bhopal's immersion ghats by water-quality risk against CPCB Class B limits, using three years of MPPCB readings (2023 to 2025). For each ghat it shows:
- a plain-words reason for the rank,
- what immersion does to the water (`during` vs `pre`) and whether it recovers (`after` vs `pre`),
- a confidence level, with missing data shown as missing,
- the report page behind every number,
- a short Hindi and English brief the officer can forward.

Details: [PRD](docs/PRD.md) · [Proposed solution](docs/PROPOSED_SOLUTION.md) · [Decisions](docs/DECISIONS.md) · [Deployment](docs/DEPLOYMENT.md)

## Run it (5 steps)
```bash
# 1. Backend
cd backend && python -m venv .venv && source .venv/bin/activate
# 2.
pip install -r requirements-dev.txt && python -m pytest -q
# 3.
uvicorn app.main:app --reload --port 8000
# 4. Frontend (new terminal)
cd frontend && npm install && npm run dev
# 5. Open http://localhost:5173
```
Copy `.env.example` to `backend/.env` only if you want an LLM-written brief. Without keys the app uses a template brief.

## Status
| Works | Not yet |
|---|---|
| Data loading and row classification (measured, below detection, missing) | Ghat detail page with charts (API `/api/ghat` is ready) |
| Golden tests reproducing the problem-statement numbers | Data and limits page in the UI |
| Class B limits and breach severity | Native-speaker sign-off on the Hindi brief |
| Ranking per festival with reason, confidence, impact, recovery, test priority and source pages | LLM-written brief tested with a real key (template brief is the default) |
| API: health, summary, ghats, ranking, ghat detail, brief | Robustness toggle |
| Bilingual brief (template + number-validated optional LLM), 150-word cap | Numbers spot-checked against the PDFs (`docs/FACTCHECK.md`) |
| Ranked list and brief in the UI, 72 backend tests passing | |
| Deploy config for Render and Vercel | |

"Back to pre level" is never shown as clean: a ghat whose water is no worse a week later can still be above the limits (DECISIONS D-15, D-21).

_Update this table before submitting. Honesty scores better than a hidden gap._

## Data
All data is public and comes from the participant pack ([Laaaaksh/bhopal-impact-lab-2026](https://github.com/Laaaaksh/bhopal-impact-lab-2026)) built from MPPCB visarjan reports 2023 to 2025 and CPCB water-quality criteria.
- `data/bhopal_ghats_2023_2025.csv`, `data/sample_bhopal_2025.csv`, `data/cpcb_water_quality_criteria.csv`, `data/DATA_DICTIONARY.md`: from the pack.
- `data/ghat_meta.json`: our own working list of ghats named for 2026 immersion, from Free Press Journal and The Hitavada, 26 Feb 2026. **Unverified, not an official order.**

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
