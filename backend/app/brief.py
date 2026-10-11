"""Bilingual brief generator.

Contract: the LLM only rephrases numbers computed by scoring.py. It never calculates or invents values.
A deterministic template fallback must always work so the demo cannot fail on an API error.

Public entry point: build_brief(ranking_result, festival) -> dict
"""
import json
import logging
import re

import httpx

from . import config
from .prompts import (
    ACTIONS_EN,
    ACTIONS_HI,
    FESTIVAL_HI_SHORT,
    FOOTER_EN,
    FOOTER_HI,
    PHRASES_EN,
    PHRASES_HI,
    REASON_HI,
    REASON_HI_FALLBACK,
    SITE_HI,
    SYSTEM_PROMPT,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# fmt: single place to format numbers for the brief
# ---------------------------------------------------------------------------

def fmt(v: float | None) -> str | None:
    """Format a numeric value as it should appear in the brief. None -> None."""
    if v is None:
        return None
    return f"{v:g}"


# ---------------------------------------------------------------------------
# build_facts
# ---------------------------------------------------------------------------

def _ph_dist(v: float) -> float:
    """Distance outside the pH 6.5-8.5 band; 0 when within."""
    if v < 6.5:
        return 6.5 - v
    if v > 8.5:
        return v - 8.5
    return 0.0


def _worst_reading(evidence: list[dict], parameter: str) -> dict | None:
    """Find the worst reading for a parameter from evidence rows, across all years.

    DO: lowest measured value. BOD: highest measured value.
    pH: value furthest outside 6.5-8.5.
    If even the worst reading is within the limit, status is "within_limit".
    Ties go to the latest year, so the brief points at the most recent bad reading.
    below_detection rows are used only when no measured rows exist (never shown as 0).
    Returns None when the parameter has no usable evidence rows.
    """
    rows = [e for e in evidence if e["parameter"] == parameter]
    measured = [e for e in rows if e.get("status") == "measured" and e.get("value") is not None]
    bdl = [e for e in rows if e.get("status") == "below_detection"]

    if measured:
        if parameter == "Dissolved oxygen":
            worst = min(measured, key=lambda r: (r["value"], -r["year"]))
            within = worst["value"] >= 5
        elif parameter == "BOD":
            worst = max(measured, key=lambda r: (r["value"], r["year"]))
            within = worst["value"] <= 3
        else:  # pH
            worst = max(measured, key=lambda r: (_ph_dist(r["value"]), r["year"]))
            within = _ph_dist(worst["value"]) == 0

        return {
            "value": fmt(worst["value"]),
            "year": worst["year"],
            "phase": worst["phase"],
            "status": "within_limit" if within else "measured",
        }

    if bdl:
        r = max(bdl, key=lambda r2: r2["year"])
        return {
            "value": None,
            "year": r["year"],
            "phase": r["phase"],
            "status": "below_detection",
        }

    return None


def _action_key(ghat: dict) -> str:
    """Pick one action per top ghat from computed values only (D-22).

    Thin data comes first: a Low or Medium confidence ghat needs a reading more than it
    needs a decision, and those ghats are exactly the ones `test_priority` lifts.
    Then immersion damage, then a poor baseline. Nothing here is a health statement.
    """
    if ghat.get("confidence", {}).get("level", "Low") != "High":
        return "test"
    if ghat.get("quadrant") in ("damaged_by_immersion", "both") or ghat.get("recovery") == "poor":
        return "clear_and_aerate"
    if ghat.get("risk_level") in ("High", "Medium"):
        return "clean_before"
    return "watch"


def build_facts(ranking_result: dict, festival: str) -> dict:
    """Build the small facts dict from ranking output for the brief."""
    ranking = ranking_result.get("ranking", [])
    no_data_sites_raw = ranking_result.get("no_data_sites", [])

    # Collect years from all evidence across all ranked ghats
    years: set[int] = set()
    for ghat in ranking:
        for ev in ghat.get("evidence", []):
            years.add(ev["year"])
    years_sorted = sorted(years)

    # Top 3 ghats by rank (already sorted)
    top: list[dict] = []
    for ghat in ranking[:3]:
        evidence = ghat.get("evidence", [])
        conf = ghat.get("confidence", {})
        # D-15: "good" only means no worse than before immersion. Say whether water is still above limits.
        recovery = ghat["recovery"]
        after_sev = ghat.get("after_severity")
        if recovery == "good":
            recovery = "good_above_limits" if (after_sev is not None and after_sev > 0) else "good_within_limits"
        top.append({
            "rank": ghat["rank"],
            "site": ghat["site"],
            "risk_level": ghat["risk_level"],
            "quadrant": ghat["quadrant"],
            "recovery": recovery,
            "confidence": conf.get("level", "Low"),
            "confidence_reasons": conf.get("reasons", []),
            "worst": {
                "do": _worst_reading(evidence, "Dissolved oxygen"),
                "bod": _worst_reading(evidence, "BOD"),
                "ph": _worst_reading(evidence, "pH"),
            },
            "bmc_list_2026": ghat.get("bmc_list_2026", "unknown"),
            "action": _action_key(ghat),
        })

    # Low-confidence sites (from all ranked ghats, not just top 3)
    low_conf = [
        ghat["site"] for ghat in ranking
        if ghat.get("confidence", {}).get("level") != "High"
    ]

    no_data_names = [s["name"] for s in no_data_sites_raw]

    return {
        "festival": festival,
        "years": years_sorted,
        "limits": {"do_min": 5, "bod_max": 3, "ph_min": 6.5, "ph_max": 8.5},
        "top": top,
        "no_data_sites": no_data_names,
        "low_confidence_sites": low_conf,
    }


# ---------------------------------------------------------------------------
# render_template  (no LLM, always works offline)
# ---------------------------------------------------------------------------

MAX_WORDS = 150  # per language, footer included

# Detail levels tried in order until the brief fits MAX_WORDS.
# 0: everything; 1: drop confidence reasons (the level stays);
# 2: also drop the "thin data" line; 3: also drop the quadrant phrase;
# 4: also drop the recovery phrase. The action line is never dropped (D-22).
_DETAIL_LEVELS = (0, 1, 2, 3, 4)


def _years_text(years: list[int], joiner: str = "and") -> str:
    if not years:
        return "unknown years"
    if len(years) > 2 and years == list(range(years[0], years[-1] + 1)):
        return f"{years[0]}-{years[-1]}"
    if len(years) == 1:
        return str(years[0])
    if len(years) == 2:
        return f"{years[0]} {joiner} {years[1]}"
    return ", ".join(str(y) for y in years[:-1]) + f" {joiner} {years[-1]}"


def _reading_text(param_key: str, worst: dict | None, phrases: dict,
                  label: str) -> str | None:
    """Format one worst reading. Returns None to skip (within limits, or pH absent)."""
    if worst is None:
        if param_key == "ph":
            return None  # pH not tested: not worth a mention
        return f"{label} {phrases['missing']}"

    if worst["status"] == "within_limit":
        return None

    if worst["status"] == "below_detection":
        return f"{label} {phrases['bdl']} ({worst['year']})"

    if worst["value"] is None:
        return f"{label} {phrases['missing']}"

    unit = " mg/l" if param_key != "ph" else ""
    return f"{label} {worst['value']}{unit} ({worst['year']})"


def _confidence_reason_hi(reasons: list[str]) -> str:
    """Translate confidence reasons to Hindi via the REASON_HI patterns."""
    parts: list[str] = []
    for r in reasons:
        for pattern, template in REASON_HI:
            m = re.search(pattern, r)
            if m:
                groups = m.groupdict()
                if "festival" in groups:
                    groups["festival"] = FESTIVAL_HI_SHORT.get(groups["festival"], groups["festival"])
                parts.append(template.format(**groups))
                break
        else:
            parts.append(REASON_HI_FALLBACK)
    # Keep order, drop duplicates (several reasons can share the fallback)
    return "; ".join(dict.fromkeys(parts))


def _low_not_top(facts: dict) -> list[str]:
    top_names = {g["site"] for g in facts["top"]}
    return [s for s in facts.get("low_confidence_sites", []) if s not in top_names]


def _render_en(facts: dict, level: int) -> str:
    lines = [
        f"Visarjan Ghat Watch: {facts['festival']} brief",
        f"MPPCB readings {_years_text(facts['years'])} vs CPCB Class B "
        f"(DO>=5, BOD<=3 mg/l, pH 6.5-8.5).",
        "",
        "Ghats to act on first:",
    ]

    for g in facts["top"]:
        readings = [
            t for key, label in (("do", "DO"), ("bod", "BOD"), ("ph", "pH"))
            if (t := _reading_text(key, g["worst"].get(key), PHRASES_EN, label)) is not None
        ]
        line = (f"{g['rank']}. {g['site']}: {PHRASES_EN['risk'][g['risk_level']]} risk. "
                f"{', '.join(readings) or PHRASES_EN['within']}.")
        if level < 4:
            quad = PHRASES_EN["quadrant"].get(g["quadrant"], "") if level < 3 else ""
            recov = PHRASES_EN["recovery"].get(g["recovery"], "")
            line += f" {quad} {recov}"
        if g["confidence"] != "High":
            line = line.rstrip() + f" {g['confidence']} confidence"
            if level < 1 and g["confidence_reasons"]:
                line += ": " + "; ".join(g["confidence_reasons"])
            line += "."
        # The action is the point of the brief, so it survives every detail level (D-22).
        line = line.rstrip() + " " + ACTIONS_EN[g["action"]]
        lines.append(" ".join(line.split()))

    if facts["no_data_sites"]:
        lines.append("")
        lines.append(f"No data: {', '.join(facts['no_data_sites'])}. Test before use.")

    thin = _low_not_top(facts)
    if thin and level < 2:
        lines.append(f"Thin data: {', '.join(thin)}.")

    return "\n".join(lines)


def _render_hi(facts: dict, level: int) -> str:
    festival_hi = FESTIVAL_HI_SHORT.get(facts["festival"], facts["festival"])
    lines = [
        f"विसर्जन घाट वॉच: {festival_hi} ब्रीफ",
        f"MPPCB रीडिंग {_years_text(facts['years'], 'और')}, "
        f"CPCB क्लास B सीमा से तुलना (DO>=5, BOD<=3 mg/l, pH 6.5-8.5)।",
        "",
        "इन घाटों पर पहले ध्यान:",
    ]

    first_do = True
    for g in facts["top"]:
        site_hi = SITE_HI.get(g["site"], g["site"])
        readings = []
        for key in ("do", "bod", "ph"):
            if key == "do":
                label = "DO (घुलित ऑक्सीजन)" if first_do else "DO"
            else:
                label = "BOD" if key == "bod" else "pH"
            t = _reading_text(key, g["worst"].get(key), PHRASES_HI, label)
            if t is not None:
                readings.append(t)
                if key == "do":
                    first_do = False

        line = (f"{g['rank']}. {site_hi}: जोखिम {PHRASES_HI['risk'][g['risk_level']]}। "
                f"{', '.join(readings) or PHRASES_HI['within']}।")
        if level < 4:
            quad = PHRASES_HI["quadrant"].get(g["quadrant"], "") if level < 3 else ""
            recov = PHRASES_HI["recovery"].get(g["recovery"], "")
            line += f" {quad} {recov}"
        if g["confidence"] != "High":
            line = line.rstrip() + f" भरोसा {PHRASES_HI['confidence'][g['confidence']]}"
            if level < 1 and g["confidence_reasons"]:
                line += ": " + _confidence_reason_hi(g["confidence_reasons"])
            line += "।"
        line = line.rstrip() + " " + ACTIONS_HI[g["action"]]
        lines.append(" ".join(line.split()))

    if facts["no_data_sites"]:
        lines.append("")
        names_hi = ", ".join(SITE_HI.get(s, s) for s in facts["no_data_sites"])
        lines.append(f"डेटा नहीं: {names_hi}। पहले जाँच कराएँ।")

    thin = _low_not_top(facts)
    if thin and level < 2:
        names_hi = ", ".join(SITE_HI.get(s, s) for s in thin)
        lines.append(f"कम डेटा: {names_hi}।")

    return "\n".join(lines)


def _word_count(body: str, footer: str) -> int:
    return len((body + "\n\n" + footer).split())


def render_template(facts: dict) -> dict:
    """Render the deterministic template brief from facts.

    Returns {"en": str, "hi": str} without footer.
    Plain text, WhatsApp-friendly: no markdown tables, no emoji.
    Limits stated once in the header; readings show values only.
    Both languages use the same detail level (so they say the same thing): the most
    detailed one where each fits MAX_WORDS, footer included.
    Top ghats and no-data sites are never dropped.
    """
    for level in _DETAIL_LEVELS:
        en, hi = _render_en(facts, level), _render_hi(facts, level)
        if _word_count(en, FOOTER_EN) <= MAX_WORDS and _word_count(hi, FOOTER_HI) <= MAX_WORDS:
            break
    return {"en": en, "hi": hi}


# ---------------------------------------------------------------------------
# validate  (runs on LLM output; also used in tests on the template)
# ---------------------------------------------------------------------------

_DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")

_HEALTH_WORDS = re.compile(
    r'\b(?:health\w*|disease\w*|illness\w*|safe(?:ty)?|unsafe|toxic\w*|danger\w*|harm\w*)\b|'
    r'(?:स्वास्थ्य|बीमारी|रोग|सुरक्षित|असुरक्षित|ज़हरीला|जहरीला|खतरनाक|ख़तरनाक|हानिकारक)',
    re.IGNORECASE,
)

_NUMBER_WORDS_EN = re.compile(
    r'\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten'
    r'|half|double|twice)\b',
    re.IGNORECASE,
)

_NUM_RE = re.compile(r'\d+(?:\.\d+)?')


def _extract_allowed(facts: dict) -> set[float]:
    """Walk the facts dict recursively and collect every number."""
    allowed: set[float] = set()

    def _walk(obj: object) -> None:
        if isinstance(obj, dict):
            for v in obj.values():
                _walk(v)
        elif isinstance(obj, list):
            for item in obj:
                _walk(item)
        elif isinstance(obj, (int, float)):
            allowed.add(float(obj))
        elif isinstance(obj, str):
            for m in _NUM_RE.findall(obj):
                allowed.add(float(m))

    _walk(facts)

    # List indices 1..len(top)
    if "top" in facts:
        for i in range(1, len(facts["top"]) + 1):
            allowed.add(float(i))

    # Footer date (20 Oct)
    allowed.add(20.0)

    return allowed


def check_numbers(text: str, facts: dict) -> tuple[bool, str]:
    """Every number in the text (Devanagari digits included) must appear in facts."""
    normalised = text.translate(_DEVANAGARI_DIGITS)
    allowed = _extract_allowed(facts)
    for num_str in _NUM_RE.findall(normalised):
        num = float(num_str)
        if not any(abs(num - a) < 1e-9 for a in allowed):
            return False, f"Number {num_str} not found in facts"
    return True, ""


def validate(text: str, facts: dict, lang: str) -> tuple[bool, str]:
    """Validate body text (before footer is appended).

    - Numbers must appear in the facts dict.
    - No percentages, health words, or English number words.
    - Every top site and no-data site must be mentioned.
    - Word count (body + footer) must be <= MAX_WORDS.
    - Hindi text must be mostly Devanagari (>= 60% of letters).
    """
    normalised = text.translate(_DEVANAGARI_DIGITS)

    # Percentages
    if "%" in normalised:
        return False, "Contains percentage"

    # Health words (body only — footer excluded since it's not appended yet)
    if _HEALTH_WORDS.search(normalised):
        return False, "Contains health-related words"

    # Number words (English only). Words already present in facts strings are fine,
    # e.g. the confidence reason "Only one year of data".
    if lang == "en":
        facts_words = {w.lower() for w in _NUMBER_WORDS_EN.findall(json.dumps(facts))}
        for w in _NUMBER_WORDS_EN.findall(normalised):
            if w.lower() not in facts_words:
                return False, f"Contains number word '{w}'"

    # Number check
    ok, reason = check_numbers(text, facts)
    if not ok:
        return False, reason

    # Coverage: every top site and every no-data site must appear
    if lang == "en":
        for g in facts.get("top", []):
            if g["site"] not in text:
                return False, f"Missing site: {g['site']}"
        for s in facts.get("no_data_sites", []):
            if s not in text:
                return False, f"Missing no-data site: {s}"
    elif lang == "hi":
        for g in facts.get("top", []):
            hi_name = SITE_HI.get(g["site"], g["site"])
            if hi_name not in text:
                return False, f"Missing Hindi site: {hi_name}"
        for s in facts.get("no_data_sites", []):
            hi_name = SITE_HI.get(s, s)
            if hi_name not in text:
                return False, f"Missing Hindi no-data site: {hi_name}"

    # Word count (body + footer)
    footer = FOOTER_EN if lang == "en" else FOOTER_HI
    word_count = _word_count(text, footer)
    if word_count > MAX_WORDS:
        return False, f"Over {MAX_WORDS} words ({word_count})"

    # Hindi must be mostly Devanagari
    if lang == "hi":
        letters = [c for c in text if c.isalpha()]
        if letters:
            devanagari = sum(1 for c in letters if '\u0900' <= c <= '\u097F')
            ratio = devanagari / len(letters)
            if ratio < 0.60:
                return False, f"Hindi text not mostly Devanagari ({ratio:.0%})"

    return True, ""


# ---------------------------------------------------------------------------
# call_llm  (optional; any failure -> None -> template fallback)
# ---------------------------------------------------------------------------

def call_llm(facts: dict) -> dict | None:
    """Call LLM to rephrase the brief. Returns {"en", "hi"} or None."""
    provider = config.LLM_PROVIDER.lower()
    if provider == "none":
        return None

    # Attach Hindi site names so the LLM can use them
    llm_facts = dict(facts)
    llm_facts["site_names_hi"] = {}
    llm_facts["top"] = [
        {**g, "action_en": ACTIONS_EN[g["action"]], "action_hi": ACTIONS_HI[g["action"]]}
        for g in facts.get("top", [])
    ]
    for g in facts.get("top", []):
        llm_facts["site_names_hi"][g["site"]] = SITE_HI.get(g["site"], g["site"])
    for s in facts.get("no_data_sites", []):
        llm_facts["site_names_hi"][s] = SITE_HI.get(s, s)

    user_msg = "FACTS:\n" + json.dumps(llm_facts, ensure_ascii=False)

    try:
        if provider == "groq":
            return _call_groq(user_msg)
        logger.warning("Unknown LLM_PROVIDER: %s", provider)
        return None
    except Exception as exc:
        logger.warning("LLM call failed: %s", exc)
        return None


GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def _call_groq(user_msg: str) -> dict | None:
    """Groq (OpenAI-compatible API) running an open-weight model, gpt-oss-120b by default."""
    key = config.GROQ_API_KEY
    if not key:
        logger.warning("GROQ_API_KEY not set")
        return None
    resp = httpx.post(
        GROQ_URL,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": config.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg},
            ],
            "temperature": 0.2,
            "max_completion_tokens": 4000,
            # gpt-oss is a reasoning model: keep reasoning short and out of the reply
            **({"reasoning_effort": "low", "include_reasoning": False}
               if config.GROQ_MODEL.startswith("openai/gpt-oss") else {}),
        },
        timeout=20.0,
    )
    resp.raise_for_status()
    choice = resp.json()["choices"][0]
    if choice.get("finish_reason") != "stop":
        logger.warning("Groq finish_reason=%s", choice.get("finish_reason"))
        return None
    return _parse_json_block(choice["message"].get("content") or "")


def _parse_json_block(text: str) -> dict | None:
    """Extract and parse the first JSON object {en, hi} from text (tolerates code fences)."""
    start = text.find("{")
    if start == -1:
        return None
    try:
        obj, _ = json.JSONDecoder().raw_decode(text[start:])
    except json.JSONDecodeError:
        return None
    if isinstance(obj, dict) and isinstance(obj.get("en"), str) and isinstance(obj.get("hi"), str):
        return {"en": obj["en"], "hi": obj["hi"]}
    return None


# ---------------------------------------------------------------------------
# add_footer
# ---------------------------------------------------------------------------

def add_footer(brief: dict) -> dict:
    """Append the fixed disclaimer footer to both languages."""
    brief["en"] = brief["en"].rstrip() + "\n\n" + FOOTER_EN
    brief["hi"] = brief["hi"].rstrip() + "\n\n" + FOOTER_HI
    return brief


# ---------------------------------------------------------------------------
# build_brief  (public entry point — used by main.py)
# ---------------------------------------------------------------------------

def build_brief(ranking_result: dict, festival: str) -> dict:
    """Build the bilingual brief from ranking output.

    Returns {festival, en, hi, source, numbers_validated} matching the API contract.
    """
    facts = build_facts(ranking_result, festival)

    # Always have the template ready
    template = render_template(facts)
    source = "template"
    brief = dict(template)  # shallow copy
    # Template numbers come straight from facts; check anyway so the flag is earned
    numbers_validated = all(check_numbers(template[lang], facts)[0] for lang in ("en", "hi"))

    # Try LLM if configured
    if config.LLM_PROVIDER.lower() != "none":
        llm_result = call_llm(facts)
        if llm_result is not None:
            en_ok, en_reason = validate(llm_result["en"], facts, "en")
            hi_ok, hi_reason = validate(llm_result["hi"], facts, "hi")
            if en_ok and hi_ok:
                brief = llm_result
                source = "llm"
                numbers_validated = True
            else:
                reason = en_reason if not en_ok else hi_reason
                logger.warning("brief fallback: %s", reason)

    brief = add_footer(brief)

    return {
        "festival": festival,
        "en": brief["en"],
        "hi": brief["hi"],
        "source": source,
        "numbers_validated": numbers_validated,
    }
