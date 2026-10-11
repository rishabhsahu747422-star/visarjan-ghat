import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .data_loader import list_ghats, load_readings
from .limits import CLASS_B, CONTEXT_ONLY
from .scoring import rank_ghats, ghat_detail

app = FastAPI(title="Visarjan Ghat Watch API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # preview deployments
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/summary")
def summary():
    """Golden numbers: must match the problem statement. Used by tests and the 'Data and limits' page."""
    df = load_readings()
    do = df[(df.parameter == "Dissolved oxygen") & (df.status == "measured")]
    bod = df[(df.parameter == "BOD") & (df.status == "measured")]
    return {
        "rows": len(df),
        "do_readings": len(do),
        "do_below_5": int((do.value < 5).sum()),
        "bod_readings": len(bod),
        "bod_above_3": int((bod.value > 3).sum()),
        "status_counts": df.status.value_counts().to_dict(),
        "limits": {k: v.__dict__ for k, v in CLASS_B.items()},
        "context_only": CONTEXT_ONLY,
    }


@app.get("/api/ghats")
def ghats():
    meta = json.loads((config.DATA_DIR / "ghat_meta.json").read_text(encoding="utf-8"))
    out = []
    for g in list_ghats():
        g["bmc_list_2026"] = meta["ghats"].get(g["site"], {}).get("bmc_list_2026", "unknown")
        out.append(g)
    return {"ghats": out, "no_data_sites": meta["no_data_sites"], "meta_note": meta["_note"]}


@app.get("/api/ranking")
def ranking(festival: str = "Durga"):
    if festival not in {"Durga", "Ganesh"}:
        raise HTTPException(400, "festival must be Durga or Ganesh")
    result = rank_ghats(festival)
    return {"festival": festival, **result}


@app.get("/api/ghat")
def ghat(site: str, festival: str = "Durga"):
    if festival not in {"Durga", "Ganesh"}:
        raise HTTPException(400, "festival must be Durga or Ganesh")
    detail = ghat_detail(site, festival)
    if detail is None:
        raise HTTPException(404, f"No data for site '{site}' in {festival}")
    return detail
