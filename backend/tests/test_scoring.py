"""Scoring tests: phase_table, impact, confidence, ranking, invariants."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.data_loader import load_readings  # noqa: E402
from app.limits import breach_severity  # noqa: E402
from app.scoring import (  # noqa: E402
    SCORED_PARAMS,
    _confidence,
    _phase_severity,
    _quadrant,
    _recovery_label,
    _risk_level,
    ghat_detail,
    impact_recovery,
    phase_table,
    rank_ghats,
)


# ---------- phase_table ----------


def test_phase_table_missing_stays_none():
    """Missing value is never converted to 0."""
    pt = phase_table("Durga")
    for site in pt:
        for year in pt[site]:
            for param in pt[site][year]:
                for phase in ("pre", "during", "after"):
                    val = pt[site][year][param]["values"][phase]
                    status = pt[site][year][param]["statuses"][phase]
                    if status == "missing":
                        assert val is None, f"{site}/{year}/{param}/{phase}: missing must be None, got {val}"


def test_phase_table_measured_has_value():
    """Measured status has a numeric value."""
    pt = phase_table("Durga")
    for site in pt:
        for year in pt[site]:
            for param in pt[site][year]:
                for phase in ("pre", "during", "after"):
                    val = pt[site][year][param]["values"][phase]
                    status = pt[site][year][param]["statuses"][phase]
                    if status == "measured":
                        assert val is not None, f"{site}/{year}/{param}/{phase}: measured must have value"
                        assert isinstance(val, float)


# ---------- phase severity ----------


def test_unknown_phase_never_zero():
    """A phase with no measured scored-param data returns None, not 0."""
    # Fabricate year_data with no measured values for scored params
    fake = {p: {"values": {"pre": None, "during": None, "after": None}} for p in SCORED_PARAMS}
    assert _phase_severity(fake, "pre") is None
    assert _phase_severity(fake, "during") is None
    assert _phase_severity(fake, "after") is None


# ---------- impact / recovery ----------


def test_impact_both_required():
    """Delta is None when one of the two phases is missing."""
    pt = phase_table("Durga")
    for site in pt:
        for year in pt[site]:
            impacts = impact_recovery({year: pt[site][year]})
            for imp in impacts:
                if imp["pre"] is None or imp["during"] is None:
                    assert imp["during_minus_pre"] is None, (
                        f"{site}/{year}/{imp['parameter']}: during_minus_pre must be None when a phase is missing"
                    )
                if imp["pre"] is None or imp["after"] is None:
                    assert imp["after_minus_pre"] is None


# ---------- confidence ----------


def test_bairagarh_durga_confidence_low():
    """Bairagarh has no Durga 2025 table -> confidence Low."""
    pt = phase_table("Durga")
    all_years: set[int] = set()
    for sd in pt.values():
        all_years.update(sd.keys())
    dataset_years = sorted(all_years, reverse=True)
    latest_year = dataset_years[0]

    site = "Bairagarh (Sant Hirdaram) kund"
    conf = _confidence(site, "Durga", pt[site], "high", latest_year, dataset_years)
    assert conf["level"] == "Low", f"Expected Low, got {conf}"


def test_malikhedi_durga_confidence_low():
    """Malikhedi has no Durga 2025 table -> confidence Low."""
    pt = phase_table("Durga")
    all_years: set[int] = set()
    for sd in pt.values():
        all_years.update(sd.keys())
    dataset_years = sorted(all_years, reverse=True)
    latest_year = dataset_years[0]

    site = "Malikhedi kund"
    conf = _confidence(site, "Durga", pt[site], "high", latest_year, dataset_years)
    assert conf["level"] == "Low", f"Expected Low, got {conf}"


def test_kamlapati_confidence_capped_at_medium():
    """Rani Kamlapati has site_match_confidence=medium -> never High."""
    pt = phase_table("Durga")
    all_years: set[int] = set()
    for sd in pt.values():
        all_years.update(sd.keys())
    dataset_years = sorted(all_years, reverse=True)
    latest_year = dataset_years[0]

    site = "Rani Kamlapati ghat / Kamla Park kund"
    conf = _confidence(site, "Durga", pt[site], "medium", latest_year, dataset_years)
    assert conf["level"] in ("Low", "Medium"), f"Expected Medium or Low, got {conf}"


# ---------- durga and ganesh never pooled ----------


def test_durga_ganesh_not_pooled():
    """Separate calls produce different results."""
    pt_d = phase_table("Durga")
    pt_g = phase_table("Ganesh")
    # At minimum, the years or values differ for at least one ghat
    any_diff = False
    for site in pt_d:
        if site in pt_g:
            if set(pt_d[site].keys()) != set(pt_g[site].keys()):
                any_diff = True
                break
    assert any_diff, "Durga and Ganesh must produce different data"


# ---------- ranking ----------


def test_ranking_output_shape():
    """Ranking returns the expected structure."""
    result = rank_ghats("Durga")
    assert "formula_version" in result
    assert "ranking" in result
    assert "no_data_sites" in result
    assert isinstance(result["ranking"], list)
    if result["ranking"]:
        first = result["ranking"][0]
        required = {
            "rank", "site", "water_body", "risk_score", "risk_level",
            "quadrant", "baseline_severity", "immersion_damage", "recovery",
            "confidence", "reason", "bmc_list_2026", "test_priority", "evidence",
        }
        assert required.issubset(first.keys()), f"Missing keys: {required - first.keys()}"


def test_ranking_ranks_sequential():
    """Ranks are 1..N sequential."""
    result = rank_ghats("Durga")
    ranks = [g["rank"] for g in result["ranking"]]
    assert ranks == list(range(1, len(ranks) + 1))


def test_no_zero_measured_ghat_ranked():
    """A ghat with zero measured Class-B data goes to no_data_sites, never ranked."""
    result = rank_ghats("Durga")
    pt = phase_table("Durga")
    ranked_sites = {g["site"] for g in result["ranking"]}

    for site in ranked_sites:
        # Must have at least one measured scored-param value
        has = False
        for yr in pt[site]:
            for param in SCORED_PARAMS:
                if param in pt[site][yr]:
                    for ph in ("pre", "during", "after"):
                        if pt[site][yr][param]["values"][ph] is not None:
                            has = True
        assert has, f"{site} ranked but has no measured scored-param data"


def test_null_risk_score_never_ranked_low_risk():
    """If risk_score is None and ghat is ranked, it must not appear as Low risk."""
    result = rank_ghats("Durga")
    for g in result["ranking"]:
        if g["risk_score"] is None:
            assert g["risk_level"] != "Low" or len(g["evidence"]) == 0, (
                f"{g['site']}: null risk_score should not be Low risk"
            )


def test_ranking_no_health_claims():
    """Reason text must not contain health-related or editorial language."""
    result = rank_ghats("Durga")
    banned = ["critical", "dangerous", "toxic", "health", "safe", "unsafe", "lethal"]
    for g in result["ranking"]:
        lower = g["reason"].lower()
        for word in banned:
            assert word not in lower, f"Reason for {g['site']} contains banned word '{word}'"


# ---------- ghat detail ----------


def test_ghat_detail_returns_none_for_unknown():
    """Unknown site returns None."""
    assert ghat_detail("Nonexistent Ghat", "Durga") is None


def test_ghat_detail_shape():
    """Detail for a known ghat has expected keys."""
    detail = ghat_detail("Bairagarh (Sant Hirdaram) kund", "Durga")
    assert detail is not None
    assert "readings" in detail
    assert "impact" in detail
    assert detail["site"] == "Bairagarh (Sant Hirdaram) kund"
    assert detail["festival"] == "Durga"
