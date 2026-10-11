"""Scoring module (the core of the product). See docs/PROPOSED_SOLUTION.md section 4.

Implements in order:
  1. phase_table        -> per ghat/year/parameter: pre, during, after (None when missing)
  2. impact_recovery    -> during-pre and after-pre, only over params present in both phases
  3. confidence         -> High / Medium / Low per ghat with reasons
  4. rank_ghats         -> ranked list with risk score, quadrant, reason, sources
  5. ghat_detail        -> readings and impact for one ghat

Rules (PRD s6, DECISIONS.md):
  - missing is never clean; BDL is not zero; Durga and Ganesh never pooled
  - unknown phase never scored as 0
  - ghat with zero measured Class-B data -> no_data_sites, never ranked
  - during-pre, after-pre, quadrant y: only over parameters present in both phases
  - recovery: good if after_severity <= pre_severity + 0.05, poor otherwise, unknown if either missing
  - reason text: factual numbers vs limits only, no words like "critical"
"""
import json

import pandas as pd

from .config import DATA_DIR
from .data_loader import load_readings, list_ghats
from .limits import CLASS_B, breach_severity

SCORED_PARAMS = ["Dissolved oxygen", "BOD", "pH"]
PHASE_WEIGHTS = {"during": 0.5, "after": 0.3, "pre": 0.2}
RECENCY_BASE = [0.5, 0.3, 0.2]  # position 0 = latest year in dataset

# Quadrant thresholds (v0)
QUAD_BASELINE_THRESH = 0.3
QUAD_DAMAGE_THRESH = 0.1

# Recovery tolerance (D-11 in DECISIONS.md)
RECOVERY_TOLERANCE = 0.05


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _limit_text(param: str) -> str:
    """Human-readable limit string for a scored parameter."""
    lim = CLASS_B[param]
    if lim.min is not None and lim.max is not None:
        return f"{lim.min} to {lim.max}"
    elif lim.min is not None:
        return f">= {lim.min} {lim.unit}".strip()
    else:
        return f"<= {lim.max} {lim.unit}".strip()


def _recency_weights(dataset_years: list[int], ghat_years: set[int]) -> dict[int, float]:
    """Assign recency weights based on position in dataset_years (descending).

    Years the ghat does not have get skipped; remaining weights are renormalised.
    """
    raw: dict[int, float] = {}
    for i, year in enumerate(dataset_years):
        if year in ghat_years and i < len(RECENCY_BASE):
            raw[year] = RECENCY_BASE[i]
    if not raw:
        return {}
    total = sum(raw.values())
    return {y: w / total for y, w in raw.items()}


# ---------------------------------------------------------------------------
# phase_table
# ---------------------------------------------------------------------------

def phase_table(festival: str) -> dict:
    """Per ghat / year / parameter / phase data.

    Returns nested dict::

        {site: {year: {param: {
            "values":            {"pre": float|None, "during": float|None, "after": float|None},
            "statuses":          {"pre": str, ...},
            "source_pages":      {"pre": int|None, ...},
            "values_as_printed": {"pre": str|None, ...},
        }}}}
    """
    df = load_readings()
    df = df[df.festival == festival]

    result: dict = {}
    for row in df.itertuples(index=False):
        site = row.site
        year = int(row.year)
        param = row.parameter
        phase = str(row.phase)

        entry = (
            result
            .setdefault(site, {})
            .setdefault(year, {})
            .setdefault(param, {
                "values": {"pre": None, "during": None, "after": None},
                "statuses": {"pre": "missing", "during": "missing", "after": "missing"},
                "source_pages": {"pre": None, "during": None, "after": None},
                "values_as_printed": {"pre": None, "during": None, "after": None},
            })
        )

        entry["statuses"][phase] = row.status
        entry["source_pages"][phase] = int(row.source_page) if pd.notna(row.source_page) else None
        entry["values_as_printed"][phase] = str(row.value_as_printed) if pd.notna(row.value_as_printed) else None

        if row.status == "measured":
            entry["values"][phase] = float(row.value)

    return result


# ---------------------------------------------------------------------------
# phase severity
# ---------------------------------------------------------------------------

def _phase_severity(year_data: dict, phase: str) -> float | None:
    """Mean breach severity across DO, BOD, pH for one phase.

    Returns None if no scored parameter has a measured value at this phase.
    Unknown phase is never scored as 0.
    """
    breaches: list[float] = []
    for param in SCORED_PARAMS:
        if param not in year_data:
            continue
        val = year_data[param]["values"][phase]
        if val is not None:
            breaches.append(breach_severity(param, val))
    return sum(breaches) / len(breaches) if breaches else None


# ---------------------------------------------------------------------------
# risk score
# ---------------------------------------------------------------------------

def _year_risk(year_data: dict) -> float | None:
    """Weighted phase severity for one year.  None if no phase has data."""
    severities: dict[str, float] = {}
    for phase in ("pre", "during", "after"):
        s = _phase_severity(year_data, phase)
        if s is not None:
            severities[phase] = s

    if not severities:
        return None

    total_w = sum(PHASE_WEIGHTS[p] for p in severities)
    return sum(severities[p] * PHASE_WEIGHTS[p] / total_w for p in severities)


def _risk_score(pt_site: dict, dataset_years: list[int]) -> float | None:
    """Recency-weighted risk score across years.  None if no year has data."""
    per_year: dict[int, float] = {}
    for year in dataset_years:
        if year not in pt_site:
            continue
        yr = _year_risk(pt_site[year])
        if yr is not None:
            per_year[year] = yr

    if not per_year:
        return None

    rw = _recency_weights(dataset_years, set(per_year.keys()))
    if not rw:
        return None
    return sum(per_year[y] * rw[y] for y in rw)


# ---------------------------------------------------------------------------
# impact / recovery
# ---------------------------------------------------------------------------

def impact_recovery(pt_site: dict) -> list[dict]:
    """Per year / parameter: during-pre and after-pre deltas.

    Deltas computed only when both phases have measured values for that parameter.
    """
    impacts: list[dict] = []
    for year in sorted(pt_site.keys()):
        for param in SCORED_PARAMS:
            if param not in pt_site[year]:
                continue
            vals = pt_site[year][param]["values"]
            pre = vals["pre"]
            during = vals["during"]
            after = vals["after"]
            impacts.append({
                "year": year,
                "parameter": param,
                "pre": pre,
                "during": during,
                "after": after,
                "during_minus_pre": round(during - pre, 6) if (during is not None and pre is not None) else None,
                "after_minus_pre": round(after - pre, 6) if (after is not None and pre is not None) else None,
            })
    return impacts


def _recovery_detail(pt_site: dict, dataset_years: list[int]) -> tuple[str, float | None]:
    """Recovery assessment over matched after/pre parameters.

    good  – after_severity <= pre_severity + 0.05
    poor  – after_severity >  pre_severity + 0.05
    unknown – no year has both after and pre for any scored parameter
    Logged as D-11 in DECISIONS.md.

    "good" means NO WORSE THAN BEFORE immersion, not "within limits". The second value is the
    recency-weighted after-phase severity (0 = within limits) so the UI can show whether the
    water still breaches the limit a week later (D-15).
    """
    per_year: dict[int, tuple[float, float]] = {}

    for year in dataset_years:
        if year not in pt_site:
            continue
        year_data = pt_site[year]
        matched_pre: list[float] = []
        matched_after: list[float] = []
        for param in SCORED_PARAMS:
            if param in year_data:
                pv = year_data[param]["values"]["pre"]
                av = year_data[param]["values"]["after"]
                if pv is not None and av is not None:
                    matched_pre.append(breach_severity(param, pv))
                    matched_after.append(breach_severity(param, av))
        if matched_pre:
            per_year[year] = (
                sum(matched_pre) / len(matched_pre),
                sum(matched_after) / len(matched_after),
            )

    if not per_year:
        return "unknown", None

    rw = _recency_weights(dataset_years, set(per_year.keys()))
    if not rw:
        return "unknown", None

    pre_agg = sum(per_year[y][0] * rw[y] for y in rw)
    after_agg = sum(per_year[y][1] * rw[y] for y in rw)

    label = "good" if after_agg <= pre_agg + RECOVERY_TOLERANCE else "poor"
    return label, round(after_agg, 4)


def _recovery_label(pt_site: dict, dataset_years: list[int]) -> str:
    """Label only (kept for callers that do not need after_severity)."""
    return _recovery_detail(pt_site, dataset_years)[0]


# ---------------------------------------------------------------------------
# quadrant
# ---------------------------------------------------------------------------

def _quadrant(pt_site: dict, dataset_years: list[int]) -> tuple[float | None, float | None, str]:
    """Quadrant: x = baseline (pre severity), y = immersion damage.

    y is computed only over parameters present in both during and pre phases.
    Returns (baseline_severity, immersion_damage, quadrant_label).
    """
    year_pre_sevs: dict[int, float] = {}
    year_damages: dict[int, float] = {}

    for year in dataset_years:
        if year not in pt_site:
            continue
        year_data = pt_site[year]

        # Baseline: all measured scored params at pre
        pre_breaches: list[float] = []
        for param in SCORED_PARAMS:
            if param in year_data:
                pv = year_data[param]["values"]["pre"]
                if pv is not None:
                    pre_breaches.append(breach_severity(param, pv))
        if pre_breaches:
            year_pre_sevs[year] = sum(pre_breaches) / len(pre_breaches)

        # Immersion damage: only matched params (both during and pre)
        matched_pre: list[float] = []
        matched_dur: list[float] = []
        for param in SCORED_PARAMS:
            if param in year_data:
                pv = year_data[param]["values"]["pre"]
                dv = year_data[param]["values"]["during"]
                if pv is not None and dv is not None:
                    matched_pre.append(breach_severity(param, pv))
                    matched_dur.append(breach_severity(param, dv))
        if matched_pre:
            pre_sev = sum(matched_pre) / len(matched_pre)
            dur_sev = sum(matched_dur) / len(matched_dur)
            year_damages[year] = max(0.0, dur_sev - pre_sev)

    # Recency-weight each
    baseline: float | None = None
    damage: float | None = None

    if year_pre_sevs:
        rw = _recency_weights(dataset_years, set(year_pre_sevs.keys()))
        if rw:
            baseline = sum(year_pre_sevs[y] * rw[y] for y in rw)

    if year_damages:
        rw = _recency_weights(dataset_years, set(year_damages.keys()))
        if rw:
            damage = sum(year_damages[y] * rw[y] for y in rw)

    # Label
    if baseline is None or damage is None:
        label = "unknown"
    elif baseline >= QUAD_BASELINE_THRESH and damage >= QUAD_DAMAGE_THRESH:
        label = "both"
    elif baseline >= QUAD_BASELINE_THRESH:
        label = "already_bad"
    elif damage >= QUAD_DAMAGE_THRESH:
        label = "damaged_by_immersion"
    else:
        label = "stable"

    return baseline, damage, label


# ---------------------------------------------------------------------------
# confidence
# ---------------------------------------------------------------------------

def _confidence(
    site: str,
    festival: str,
    pt_site: dict,
    site_match_confidence: str,
    latest_year: int,
    dataset_years: list[int],
) -> dict:
    """Confidence per ghat.

    Low   – latest year missing for this ghat, or only 'during' in latest year.
    Medium – some phases or params missing, or site_match_confidence == 'medium'.
    High  – DO, BOD, pH all three phases in the latest two dataset years.
    """
    reasons: list[str] = []
    level = "High"

    # --- latest year check ---
    if latest_year not in pt_site:
        reasons.append(f"No {festival} {latest_year} data for this ghat")
        level = "Low"
    else:
        latest_data = pt_site[latest_year]
        has_phase = {"pre": False, "during": False, "after": False}
        for param in SCORED_PARAMS:
            if param in latest_data:
                for ph in ("pre", "during", "after"):
                    if latest_data[param]["values"][ph] is not None:
                        has_phase[ph] = True

        if has_phase["during"] and not has_phase["pre"] and not has_phase["after"]:
            reasons.append(f"Only 'during' phase data in {latest_year}")
            level = "Low"
        elif not all(has_phase.values()):
            missing_ph = [p for p in ("pre", "during", "after") if not has_phase[p]]
            reasons.append(f"Missing {', '.join(missing_ph)} phase(s) in {latest_year}")
            if level != "Low":
                level = "Medium"

        # Check full param coverage in latest year
        if level == "High":
            for param in SCORED_PARAMS:
                if param not in latest_data:
                    reasons.append(f"No {param} data in {latest_year}")
                    level = "Medium"
                    break
                for ph in ("pre", "during", "after"):
                    if latest_data[param]["values"][ph] is None:
                        reasons.append(f"Missing {param} {ph} in {latest_year}")
                        level = "Medium"
                        break
                if level != "High":
                    break

    # --- second-latest year check (only if still High) ---
    if level == "High":
        second_years = [y for y in dataset_years if y != latest_year and y in pt_site]
        if not second_years:
            reasons.append("Only one year of data")
            level = "Medium"
        else:
            second_year = max(second_years)
            second_data = pt_site[second_year]
            for param in SCORED_PARAMS:
                if param not in second_data:
                    reasons.append(f"No {param} data in {second_year}")
                    level = "Medium"
                    break
                for ph in ("pre", "during", "after"):
                    if second_data[param]["values"][ph] is None:
                        reasons.append(f"Missing {param} {ph} in {second_year}")
                        level = "Medium"
                        break
                if level != "High":
                    break

    # --- site match caps at Medium ---
    if site_match_confidence == "medium":
        reasons.append("Site name match confidence is medium")
        if level == "High":
            level = "Medium"

    return {"level": level, "reasons": reasons}


# ---------------------------------------------------------------------------
# evidence rows
# ---------------------------------------------------------------------------

def _build_evidence(pt_site: dict) -> list[dict]:
    """Evidence rows for scored parameters (DO, BOD, pH)."""
    evidence: list[dict] = []
    for year in sorted(pt_site.keys()):
        for param in SCORED_PARAMS:
            if param not in pt_site[year]:
                continue
            entry = pt_site[year][param]
            for phase in ("pre", "during", "after"):
                status = entry["statuses"][phase]
                if status == "missing":
                    continue
                val = entry["values"][phase]
                evidence.append({
                    "year": year,
                    "phase": phase,
                    "parameter": param,
                    "value": val,
                    "status": status,
                    "limit": _limit_text(param),
                    "breach": round(breach_severity(param, val), 4) if val is not None else None,
                    "source_page": entry["source_pages"][phase],
                })
    return evidence


# ---------------------------------------------------------------------------
# reason text
# ---------------------------------------------------------------------------

def _reason_text(evidence: list[dict]) -> str:
    """One-line factual reason: numbers vs limits, no editorialising."""
    breaches = [e for e in evidence if e.get("breach") and e["breach"] > 0]
    breaches.sort(key=lambda e: e["breach"], reverse=True)

    seen: set[str] = set()
    parts: list[str] = []
    for e in breaches:
        key = e["parameter"]
        if key in seen:
            continue
        seen.add(key)
        if key == "Dissolved oxygen":
            parts.append(f"DO {e['value']} mg/l at {e['phase']} ({e['year']}), limit {e['limit']}")
        elif key == "BOD":
            parts.append(f"BOD {e['value']} mg/l at {e['phase']} ({e['year']}), limit {e['limit']}")
        else:
            parts.append(f"pH {e['value']} at {e['phase']} ({e['year']}), limit {e['limit']}")
        if len(parts) >= 3:
            break

    return ". ".join(parts) + "." if parts else "No measured Class B breaches."


# ---------------------------------------------------------------------------
# risk level thresholds
# ---------------------------------------------------------------------------

def _risk_level(score: float | None) -> str:
    """Risk level from score.  Thresholds set after reviewing all 7 ghats (D-12)."""
    if score is None:
        return "Low"
    if score >= 0.50:
        return "High"
    if score >= 0.25:
        return "Medium"
    return "Low"


# ---------------------------------------------------------------------------
# test priority (stretch, D-16)
# ---------------------------------------------------------------------------

DATA_GAP_FACTOR = {"High": 1.0, "Medium": 1.5, "Low": 2.0}


def _test_priority(risk: float | None, confidence_level: str) -> float | None:
    """Where extra testing helps most: risk scaled up when data is thinner. Null if risk is null."""
    if risk is None:
        return None
    return round(risk * DATA_GAP_FACTOR[confidence_level], 4)


# ---------------------------------------------------------------------------
# rank_ghats  (main entry point)
# ---------------------------------------------------------------------------

def rank_ghats(festival: str) -> dict:
    """Rank ghats by water-quality risk for the given festival.

    Returns ``{"formula_version", "ranking": [...], "no_data_sites": [...]}``.
    """
    pt = phase_table(festival)
    meta = json.loads((DATA_DIR / "ghat_meta.json").read_text(encoding="utf-8"))
    ghat_list = list_ghats()

    # Dataset-level latest year (not per-ghat)
    all_years: set[int] = set()
    for site_data in pt.values():
        all_years.update(site_data.keys())
    dataset_years = sorted(all_years, reverse=True)  # [2025, 2024, 2023]
    latest_year = dataset_years[0] if dataset_years else None

    smc_lookup = {g["site"]: g.get("site_match_confidence", "high") for g in ghat_list}

    ranked: list[dict] = []
    no_data_extra: list[dict] = []

    for site_info in ghat_list:
        site = site_info["site"]
        water_body = site_info["water_body"]
        smc = smc_lookup.get(site, "high")

        # --- check for any measured scored-param data ---
        has_measured = False
        if site in pt:
            for yr in pt[site]:
                for param in SCORED_PARAMS:
                    if param in pt[site][yr]:
                        for ph in ("pre", "during", "after"):
                            if pt[site][yr][param]["values"][ph] is not None:
                                has_measured = True
                                break
                    if has_measured:
                        break
                if has_measured:
                    break

        if not has_measured:
            no_data_extra.append({
                "name": site,
                "note": f"No measured Class B data for {festival}",
            })
            continue

        pt_site = pt[site]

        risk = _risk_score(pt_site, dataset_years)
        conf = _confidence(site, festival, pt_site, smc, latest_year, dataset_years)
        baseline, damage, quad_label = _quadrant(pt_site, dataset_years)
        recovery, after_sev = _recovery_detail(pt_site, dataset_years)
        evidence = _build_evidence(pt_site)
        reason = _reason_text(evidence)
        bmc = meta["ghats"].get(site, {}).get("bmc_list_2026", "unknown")

        ranked.append({
            "site": site,
            "water_body": water_body,
            "risk_score": round(risk, 4) if risk is not None else None,
            "risk_level": None,  # set below
            "quadrant": quad_label,
            "baseline_severity": round(baseline, 4) if baseline is not None else None,
            "immersion_damage": round(damage, 4) if damage is not None else None,
            "recovery": recovery,
            "after_severity": after_sev,
            "latest_data_year": max(pt_site.keys()),
            "confidence": conf,
            "reason": reason,
            "bmc_list_2026": bmc,
            "test_priority": _test_priority(risk, conf["level"]),
            "evidence": evidence,
        })

    # Sort descending by risk_score (None last)
    ranked.sort(key=lambda g: g["risk_score"] if g["risk_score"] is not None else -1, reverse=True)

    for i, g in enumerate(ranked):
        g["rank"] = i + 1
        g["risk_level"] = _risk_level(g["risk_score"])

    # Merge no-data sites
    no_data = list(meta.get("no_data_sites", []))
    no_data.extend(no_data_extra)

    return {
        "formula_version": "v0",
        "ranking": ranked,
        "no_data_sites": no_data,
    }


# ---------------------------------------------------------------------------
# ghat_detail  (for /api/ghat endpoint)
# ---------------------------------------------------------------------------

def ghat_detail(site: str, festival: str) -> dict | None:
    """All readings and impact data for one ghat.  Returns None if not found."""
    pt = phase_table(festival)
    if site not in pt:
        return None

    pt_site = pt[site]

    # Readings: ALL parameters (not just scored)
    readings: list[dict] = []
    for year in sorted(pt_site.keys()):
        for param in sorted(pt_site[year].keys()):
            entry = pt_site[year][param]
            for phase in ("pre", "during", "after"):
                status = entry["statuses"][phase]
                if status == "missing":
                    continue
                val = entry["values"][phase]
                lim = CLASS_B.get(param)
                readings.append({
                    "year": year,
                    "phase": phase,
                    "parameter": param,
                    "value": val,
                    "status": status,
                    "value_as_printed": entry["values_as_printed"][phase],
                    "limit": _limit_text(param) if lim else None,
                    "breach": round(breach_severity(param, val), 4) if (lim and val is not None) else None,
                    "source_page": entry["source_pages"][phase],
                })

    # Impact: scored params only
    impact = impact_recovery(pt_site)

    return {
        "site": site,
        "festival": festival,
        "readings": readings,
        "impact": impact,
    }
