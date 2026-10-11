# Deployment (Render API + Vercel frontend)

Deploy after the first working build. Order matters: backend first, then frontend, then CORS.

## 1. Backend on Render
1. Push the repo to GitHub (public).
2. Render dashboard: New, Blueprint, select the repo. It reads `render.yaml`.
3. Set secrets when prompted: `ALLOWED_ORIGINS` (fill in after step 2 below), `CEREBRAS_API_KEY` or `ANTHROPIC_API_KEY` if you use an LLM. Leave `LLM_PROVIDER=none` to use the template brief.
4. Wait for the health check at `/api/health`. Note the URL, for example `https://ghat-watch-api.onrender.com`.

Free-tier services sleep after inactivity and take about a minute to wake. Hit `/api/health` a few minutes before any demo.

## 2. Frontend on Vercel
1. Vercel: Add New Project, import the repo.
2. Set **Root Directory** to `frontend`. Framework preset: Vite (also set in `frontend/vercel.json`).
3. Add environment variable `VITE_API_BASE_URL` = your Render URL (no trailing slash).
4. Deploy. Note the Vercel URL.

## 3. Close the loop
Set `ALLOWED_ORIGINS` on Render to the Vercel production URL (comma-separated for several). Vercel preview URLs (`*.vercel.app`) are already allowed by regex in `backend/app/main.py`. Tighten that regex before any real use.

## 4. Checks
- `GET <render-url>/api/summary` returns 1524 rows.
- The Vercel site lists seven ghats and shows no API error banner.
- No keys in the repo: `git grep -n "API_KEY"` should show only variable names.

## Alternative: single-origin proxy
To avoid CORS, add to `frontend/vercel.json`, before the catch-all rewrite:
`{ "source": "/api/:path*", "destination": "https://<render-url>/api/:path*" }` and leave `VITE_API_BASE_URL` empty.
