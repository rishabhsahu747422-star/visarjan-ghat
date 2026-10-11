"""Loads the MPPCB ghat readings and classifies every row.

status:
  measured         -> a number was reported
  below_detection  -> BDL / ND: very low, NOT zero, NOT missing
  missing          -> not sampled / blank / * / **: never treat as clean
"""
from functools import lru_cache

import pandas as pd

from .config import DATA_DIR

READINGS_FILE = "bhopal_ghats_2023_2025.csv"
PHASES = ["pre", "during", "after"]


def classify(value, flag) -> str:
    if pd.notna(value):
        return "measured"
    f = "" if pd.isna(flag) else str(flag).strip().upper()
    if f in {"BDL", "ND"}:
        return "below_detection"
    return "missing"


@lru_cache(maxsize=1)
def load_readings() -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / READINGS_FILE)
    df["status"] = [classify(v, f) for v, f in zip(df["value"], df["flag"])]
    df["phase"] = pd.Categorical(df["phase"], categories=PHASES, ordered=True)
    return df


def list_ghats() -> list[dict]:
    df = load_readings()
    g = (
        df.groupby("site", observed=True)
        .agg(water_body=("water_body", "first"), site_match_confidence=("site_match_confidence", "min"))
        .reset_index()
    )
    return g.to_dict(orient="records")
