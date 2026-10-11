#!/usr/bin/env python3
"""End-to-end smoke test against a running API.

    cd backend && uvicorn app.main:app --port 8000
    API_URL=http://localhost:8000 python scripts/smoke.py

Checks the contract in docs/TEAM.md for both festivals, and the rules the jury checks:
missing is never 0, BDL is not missing, Durga and Ganesh are never pooled, nulls stay null.
Exits non-zero on the first failure count above zero. No dependencies beyond the stdlib.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API_URL = os.environ.get("API_URL", "http://localhost:8000").rstrip("/")
FESTIVALS = ["Durga", "Ganesh"]
SCORED = {"Dissolved oxygen", "BOD", "pH"}

RISK_LEVELS = {"Low", "Medium", "High"}
QUADRANTS = {"already_bad", "damaged_by_immersion", "both", "stable", "unknown"}
RECOVERY = {"good", "poor", "unknown"}
CONFIDENCE = {"High", "Medium", "Low"}
STATUSES = {"measured", "below_detection", "missing"}

failures: list[str] = []
checks = 0


def check(condition: bool, message: str) -> bool:
    global checks
    checks += 1
    if not condition:
        failures.append(message)
    return condition


def get(path: str, expect: int = 200):
    url = f"{API_URL}{path}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            body = resp.read()
            status = resp.status
    except urllib.error.HTTPError as exc:
        status, body = exc.code, exc.read()
    except Exception as exc:  # noqa: BLE001 - the server being down is a normal failure here
        check(False, f"{path}: could not reach the API ({exc})")
        return None

    if not check(status == expect, f"{path}: expected HTTP {expect}, got {status}"):
        return None
    if status != 200:
        return True
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        check(False, f"{path}: response was not JSON")
        return None


def main() -> int:
    print(f"Smoke testing {API_URL}")

    # ---- health ----
    health = get("/api/health")
    check(bool(health) and health.get("status") == "ok", "/api/health: status is not ok")

    # ---- summary: the golden numbers from the problem statement ----
    summary = get("/api/summary")
    if summary:
        check(summary["rows"] == 1524, f"/api/summary: expected 1524 rows, got {summary['rows']}")
        check(
            (summary["do_below_5"], summary["do_readings"]) == (42, 116),
            f"/api/summary: expected 42 of 116 DO below 5, got "
            f"{summary['do_below_5']} of {summary['do_readings']}",
        )
        check(
            (summary["bod_above_3"], summary["bod_readings"]) == (100, 112),
            f"/api/summary: expected 100 of 112 BOD above 3, got "
            f"{summary['bod_above_3']} of {summary['bod_readings']}",
        )

    # ---- ghats ----
    ghats = get("/api/ghats")
    if ghats:
        check(len(ghats["ghats"]) == 7, f"/api/ghats: expected 7 ghats, got {len(ghats['ghats'])}")
        check(len(ghats["no_data_sites"]) >= 1, "/api/ghats: no_data_sites is empty")

    # ---- rejected input ----
    get("/api/ranking?festival=Foo", expect=400)
    get("/api/ghat?site=Nowhere%20ghat&festival=Durga", expect=404)

    rankings = {}

    for festival in FESTIVALS:
        ranking = get(f"/api/ranking?festival={festival}")
        if not ranking:
            continue
        rankings[festival] = ranking

        check(ranking["festival"] == festival, f"{festival} ranking: wrong festival echoed back")
        ranked = ranking["ranking"]
        check(len(ranked) == 7, f"{festival} ranking: expected 7 ranked ghats, got {len(ranked)}")
        check(len(ranking["no_data_sites"]) >= 1, f"{festival} ranking: no_data_sites is empty")

        ranks = [g["rank"] for g in ranked]
        check(ranks == list(range(1, len(ranked) + 1)), f"{festival} ranking: ranks are not 1..N")
        scores = [g["risk_score"] for g in ranked]
        check(
            all(a >= b for a, b in zip(scores, scores[1:]) if a is not None and b is not None),
            f"{festival} ranking: not sorted by risk score",
        )

        for g in ranked:
            where = f"{festival} / {g['site']}"
            check(g["risk_level"] in RISK_LEVELS, f"{where}: bad risk_level {g['risk_level']!r}")
            check(g["quadrant"] in QUADRANTS, f"{where}: bad quadrant {g['quadrant']!r}")
            check(g["recovery"] in RECOVERY, f"{where}: bad recovery {g['recovery']!r}")
            check(
                g["confidence"]["level"] in CONFIDENCE,
                f"{where}: bad confidence level {g['confidence']['level']!r}",
            )
            check(isinstance(g["confidence"]["reasons"], list), f"{where}: confidence.reasons is not a list")
            check(g["reason"].strip() != "", f"{where}: empty reason")
            check(g["latest_data_year"] in (2023, 2024, 2025), f"{where}: odd latest_data_year")
            # A ranked ghat always has a score; a null score must never read as Low risk.
            check(g["risk_score"] is not None, f"{where}: ranked with a null risk_score")
            check(len(g["evidence"]) > 0, f"{where}: ranked with no evidence rows")

            for e in g["evidence"]:
                tag = f"{where} {e['year']} {e['phase']} {e['parameter']}"
                check(e["status"] in STATUSES, f"{tag}: bad status {e['status']!r}")
                check(e["parameter"] in SCORED, f"{tag}: unscored parameter in ranking evidence")
                if e["status"] == "measured":
                    check(e["value"] is not None, f"{tag}: measured but value is null")
                if e["status"] == "below_detection":
                    # BDL is very low but it is NOT zero, and it must not arrive as one.
                    check(e["value"] is None, f"{tag}: below_detection carries a value")
                if e["status"] == "missing":
                    check(e["value"] is None, f"{tag}: missing carries a value")

        # ---- every ranked ghat must open ----
        for g in ranked:
            site = urllib.parse.quote(g["site"], safe="")
            detail = get(f"/api/ghat?site={site}&festival={festival}")
            if not detail:
                continue
            where = f"{festival} / {g['site']} detail"
            check(detail["site"] == g["site"], f"{where}: wrong site echoed back")
            check(detail["festival"] == festival, f"{where}: wrong festival echoed back")
            check(len(detail["readings"]) > 0, f"{where}: no readings")
            for r in detail["readings"]:
                tag = f"{where} {r['year']} {r['phase']} {r['parameter']}"
                check(r["status"] in STATUSES, f"{tag}: bad status")
                if r["status"] == "measured":
                    check(r["value"] is not None, f"{tag}: measured but value is null")
                else:
                    check(r["value"] is None, f"{tag}: non-measured row carries a value")
                if r["parameter"] not in SCORED:
                    # No Class B limit exists for it, so it can never be marked as a breach.
                    check(r["limit"] is None, f"{tag}: context-only parameter has a limit")
                    check(r["breach"] is None, f"{tag}: context-only parameter has a breach score")
            for i in detail["impact"]:
                tag = f"{where} {i['year']} {i['parameter']}"
                if i["pre"] is None or i["during"] is None:
                    check(i["during_minus_pre"] is None, f"{tag}: delta computed from a missing value")
                if i["pre"] is None or i["after"] is None:
                    check(i["after_minus_pre"] is None, f"{tag}: delta computed from a missing value")

        # ---- the slash in a site name must survive the round trip ----
        slashed = [g["site"] for g in ranked if "/" in g["site"]]
        for site in slashed:
            d = get(f"/api/ghat?site={urllib.parse.quote(site, safe='')}&festival={festival}")
            check(bool(d), f"{festival}: a site name containing '/' did not round-trip")

        # ---- brief ----
        brief = get(f"/api/brief?festival={festival}")
        if brief:
            where = f"{festival} brief"
            check(brief["festival"] == festival, f"{where}: wrong festival echoed back")
            check(brief["en"].strip() != "", f"{where}: English text is empty")
            check(brief["hi"].strip() != "", f"{where}: Hindi text is empty")
            check(brief["source"] in ("llm", "template"), f"{where}: bad source {brief['source']!r}")
            check(brief["numbers_validated"] is True, f"{where}: numbers_validated is not true")
            check(len(brief["en"].split()) <= 150, f"{where}: English is over 150 words")
            check(len(brief["hi"].split()) <= 150, f"{where}: Hindi is over 150 words")
            for word in ("recovered", "back to pre"):
                check(word not in brief["en"].lower(), f"{where}: says {word!r}")
            # Hindi must actually be in Devanagari, or the font work was pointless.
            letters = [c for c in brief["hi"] if c.isalpha()]
            devanagari = sum(1 for c in letters if "ऀ" <= c <= "ॿ")
            check(
                bool(letters) and devanagari / len(letters) >= 0.5,
                f"{where}: Hindi text is not mostly Devanagari",
            )

    # ---- Durga and Ganesh are never pooled ----
    if len(rankings) == 2:
        durga = {g["site"]: g["risk_score"] for g in rankings["Durga"]["ranking"]}
        ganesh = {g["site"]: g["risk_score"] for g in rankings["Ganesh"]["ranking"]}
        check(
            any(durga[s] != ganesh.get(s) for s in durga),
            "Durga and Ganesh returned identical scores for every ghat: they may be pooled",
        )

    print(f"\n{checks} checks run, {len(failures)} failed")
    for f in failures:
        print(f"  FAIL  {f}")
    if failures:
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
