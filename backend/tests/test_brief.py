"""Tests for the bilingual brief generator.

All run offline against the live ranking (rank_ghats on the committed CSV), so
they keep working after data/fixtures/ is deleted. No test calls a real LLM.
Run with: cd backend && python -m pytest tests/test_brief.py -v
"""
from copy import deepcopy

import pytest

from app import brief as brief_mod
from app.brief import (
    MAX_WORDS,
    add_footer,
    build_brief,
    build_facts,
    render_template,
    validate,
)
from app.prompts import FOOTER_EN, FOOTER_HI, PHRASES_EN, PHRASES_HI, SITE_HI
from app.scoring import rank_ghats

FESTIVALS = ["Durga", "Ganesh"]


@pytest.fixture(scope="module")
def rankings() -> dict:
    return {f: rank_ghats(f) for f in FESTIVALS}


@pytest.fixture(autouse=True)
def offline(monkeypatch):
    """Default every test to LLM_PROVIDER=none; LLM tests opt in explicitly."""
    monkeypatch.setattr("app.config.LLM_PROVIDER", "none")


def _facts(rankings, festival="Durga"):
    return build_facts(rankings[festival], festival)


def _valid_llm_output(facts: dict) -> dict:
    """A well-behaved LLM answer: the template itself, which only uses fact numbers."""
    return render_template(facts)


# ---- Template ----


class TestTemplate:
    @pytest.mark.parametrize("festival", FESTIVALS)
    def test_template_offline_contract_shape(self, rankings, festival):
        result = build_brief(rankings[festival], festival)
        assert set(result) == {"festival", "en", "hi", "source", "numbers_validated"}
        assert result["festival"] == festival
        assert result["source"] == "template"
        assert result["numbers_validated"] is True
        assert result["en"].strip() and result["hi"].strip()
        assert result["en"].endswith(FOOTER_EN)
        assert result["hi"].endswith(FOOTER_HI)

    @pytest.mark.parametrize("festival", FESTIVALS)
    def test_template_passes_validator(self, rankings, festival):
        facts = _facts(rankings, festival)
        t = render_template(facts)
        for lang in ("en", "hi"):
            ok, reason = validate(t[lang], facts, lang)
            assert ok, f"{festival} {lang}: {reason}"

    @pytest.mark.parametrize("festival", FESTIVALS)
    def test_word_limit_with_footer(self, rankings, festival):
        result = build_brief(rankings[festival], festival)
        assert len(result["en"].split()) <= MAX_WORDS
        assert len(result["hi"].split()) <= MAX_WORDS

    @pytest.mark.parametrize("festival", FESTIVALS)
    def test_lists_top_ghats_and_no_data_sites(self, rankings, festival):
        facts = _facts(rankings, festival)
        t = render_template(facts)
        assert len(facts["top"]) == 3
        for g in facts["top"]:
            assert g["site"] in t["en"]
            assert SITE_HI[g["site"]] in t["hi"]
        assert "Arch Bridge ghat" in t["en"]
        assert SITE_HI["Arch Bridge ghat"] in t["hi"]

    def test_says_whether_immersion_worsens(self, rankings):
        """The brief states the immersion effect for each top ghat (TEAM rules)."""
        facts = _facts(rankings, "Ganesh")
        t = render_template(facts)
        for g in facts["top"]:
            assert PHRASES_EN["quadrant"][g["quadrant"]] in t["en"]
            assert PHRASES_HI["quadrant"][g["quadrant"]] in t["hi"]

    def test_bairagarh_do_zero_is_shown(self, rankings):
        """The headline reading (DO 0 at Bairagarh, Durga 2023) reaches the brief."""
        facts = _facts(rankings, "Durga")
        bairagarh = next(g for g in facts["top"] if g["site"].startswith("Bairagarh"))
        assert bairagarh["worst"]["do"]["value"] == "0"
        assert "DO 0 mg/l (2023)" in render_template(facts)["en"]

    def test_low_confidence_flagged(self, rankings):
        facts = _facts(rankings, "Durga")
        t = render_template(facts)
        assert "Low confidence" in t["en"]
        assert f"भरोसा {PHRASES_HI['confidence']['Low']}" in t["hi"]

    def test_festivals_separate(self, rankings):
        durga = render_template(_facts(rankings, "Durga"))
        ganesh = render_template(_facts(rankings, "Ganesh"))
        assert "Ganesh" not in durga["en"] and "गणेश" not in durga["hi"]
        assert "Durga" not in ganesh["en"] and "दुर्गा" not in ganesh["hi"]

    def test_no_health_words_in_body(self, rankings):
        for f in FESTIVALS:
            t = render_template(_facts(rankings, f))
            assert not brief_mod._HEALTH_WORDS.search(t["en"])
            assert not brief_mod._HEALTH_WORDS.search(t["hi"])

    def test_trims_detail_but_never_drops_sites(self, rankings, monkeypatch):
        """Under a tight word cap the template sheds detail, not ghats."""
        monkeypatch.setattr(brief_mod, "MAX_WORDS", 125)
        facts = _facts(rankings, "Ganesh")
        t = render_template(facts)
        for g in facts["top"]:
            assert g["site"] in t["en"]
        assert "Arch Bridge ghat" in t["en"]
        assert "Only 'during' phase data" not in t["en"]  # reasons dropped first


# ---- Missing, BDL, within limits ----


class TestMissingData:
    def _first_ghat_section(self, text: str) -> str:
        return text.split("\n2.")[0]

    def test_missing_do_says_not_measured(self, rankings):
        ranking = deepcopy(rankings["Durga"])
        ranking["ranking"][0]["evidence"] = [
            e for e in ranking["ranking"][0]["evidence"] if e["parameter"] != "Dissolved oxygen"
        ]
        facts = build_facts(ranking, "Durga")
        assert facts["top"][0]["worst"]["do"] is None
        t = render_template(facts)
        first = self._first_ghat_section(t["en"])
        assert f"DO {PHRASES_EN['missing']}" in first
        assert "DO 0" not in first
        assert PHRASES_HI["missing"] in self._first_ghat_section(t["hi"])

    def test_bdl_never_zero(self, rankings):
        ranking = deepcopy(rankings["Durga"])
        for e in ranking["ranking"][0]["evidence"]:
            if e["parameter"] == "BOD":
                e["status"], e["value"] = "below_detection", None
        facts = build_facts(ranking, "Durga")
        assert facts["top"][0]["worst"]["bod"]["status"] == "below_detection"
        assert facts["top"][0]["worst"]["bod"]["value"] is None
        first = self._first_ghat_section(render_template(facts)["en"])
        assert f"BOD {PHRASES_EN['bdl']}" in first
        assert "BOD 0" not in first

    def test_within_limit_reading_not_listed_as_bad(self, rankings):
        ranking = deepcopy(rankings["Durga"])
        for e in ranking["ranking"][0]["evidence"]:
            if e["parameter"] == "Dissolved oxygen":
                e["value"] = 6.0
        facts = build_facts(ranking, "Durga")
        assert facts["top"][0]["worst"]["do"]["status"] == "within_limit"
        first = self._first_ghat_section(render_template(facts)["en"])
        assert "DO 6" not in first

    def test_hindi_reason_keeps_year(self, rankings):
        reasons = brief_mod._confidence_reason_hi(
            ["No Durga 2025 data for this ghat", "Only 'during' phase data in 2025"]
        )
        assert reasons == "दुर्गा 2025 का डेटा नहीं; 2025 में केवल विसर्जन के दौरान का डेटा"


# ---- Validator ----


class TestValidator:
    def _text_with_all_sites(self, facts, extra: str, lang="en") -> str:
        if lang == "en":
            names = [g["site"] for g in facts["top"]] + facts["no_data_sites"]
        else:
            names = [SITE_HI[g["site"]] for g in facts["top"]] + [SITE_HI[s] for s in facts["no_data_sites"]]
        return extra + " " + ". ".join(names) + "."

    def test_invented_number_rejected(self, rankings):
        facts = _facts(rankings)
        ok, reason = validate(self._text_with_all_sites(facts, "DO 4.37 mg/l."), facts, "en")
        assert not ok and "4.37" in reason

    def test_rounded_number_rejected(self, rankings):
        facts = _facts(rankings)  # Bairagarh BOD worst is 9.4; 9 is not a fact
        ok, _ = validate(self._text_with_all_sites(facts, "BOD 9 mg/l."), facts, "en")
        assert not ok

    def test_devanagari_digits_checked(self, rankings):
        facts = _facts(rankings)
        text = self._text_with_all_sites(facts, "DO ०.५ mg/l।", lang="hi")
        ok, reason = validate(text, facts, "hi")
        assert not ok and "0.5" in reason

    def test_percent_rejected(self, rankings):
        facts = _facts(rankings)
        ok, reason = validate(self._text_with_all_sites(facts, "BOD up 40%."), facts, "en")
        assert not ok and "percentage" in reason.lower()

    @pytest.mark.parametrize("phrase,lang", [
        ("Water is unsafe.", "en"),
        ("Health risk for bathers.", "en"),
        ("स्वास्थ्य के लिए खतरनाक।", "hi"),
    ])
    def test_health_words_rejected(self, rankings, phrase, lang):
        facts = _facts(rankings)
        ok, _ = validate(self._text_with_all_sites(facts, phrase, lang), facts, lang)
        assert not ok

    def test_number_words_rejected(self, rankings):
        facts = _facts(rankings)
        ok, _ = validate(self._text_with_all_sites(facts, "BOD doubled, twice the limit."), facts, "en")
        assert not ok

    def test_missing_site_rejected(self, rankings):
        facts = _facts(rankings)
        ok, reason = validate("DO 0 mg/l (2023).", facts, "en")
        assert not ok and "Missing site" in reason

    def test_hindi_must_be_devanagari(self, rankings):
        facts = _facts(rankings)
        english = ("These ghats show low dissolved oxygen and high BOD readings before, "
                   "during and after immersion across the reported years, so plan "
                   "cleaning and aeration and repeat the testing at each of these places.")
        text = self._text_with_all_sites(facts, english, lang="hi")
        ok, reason = validate(text, facts, "hi")
        assert not ok and "Devanagari" in reason


# ---- LLM path (mocked) ----


class TestLLM:
    def _enable(self, monkeypatch):
        monkeypatch.setattr("app.config.LLM_PROVIDER", "groq")
        monkeypatch.setattr("app.config.GROQ_API_KEY", "test-key")

    def test_valid_llm_output_used(self, rankings, monkeypatch):
        self._enable(monkeypatch)
        monkeypatch.setattr(brief_mod, "call_llm", _valid_llm_output)
        result = build_brief(rankings["Durga"], "Durga")
        assert result["source"] == "llm"
        assert result["numbers_validated"] is True
        assert result["en"].endswith(FOOTER_EN)

    def test_llm_invented_number_falls_back(self, rankings, monkeypatch):
        self._enable(monkeypatch)

        def bad_llm(facts):
            out = _valid_llm_output(facts)
            out["en"] = out["en"].replace("DO 0 mg/l", "DO 1.7 mg/l")
            return out

        monkeypatch.setattr(brief_mod, "call_llm", bad_llm)
        result = build_brief(rankings["Durga"], "Durga")
        assert result["source"] == "template"
        assert "1.7" not in result["en"]

    def test_llm_failure_falls_back(self, rankings, monkeypatch):
        self._enable(monkeypatch)
        monkeypatch.setattr(brief_mod, "call_llm", lambda facts: None)
        result = build_brief(rankings["Durga"], "Durga")
        assert result["source"] == "template"
        assert result["en"].strip() and result["hi"].strip()

    def test_provider_error_is_swallowed(self, rankings, monkeypatch):
        self._enable(monkeypatch)

        def boom(user_msg):
            raise RuntimeError("network down")

        monkeypatch.setattr(brief_mod, "_call_groq", boom)
        assert brief_mod.call_llm(_facts(rankings)) is None
        assert build_brief(rankings["Durga"], "Durga")["source"] == "template"

    def test_none_provider_never_calls_llm(self, rankings, monkeypatch):
        def fail(facts):
            raise AssertionError("LLM called with LLM_PROVIDER=none")

        monkeypatch.setattr(brief_mod, "call_llm", fail)
        assert build_brief(rankings["Durga"], "Durga")["source"] == "template"

    @pytest.mark.parametrize("raw,expected", [
        ('{"en": "a", "hi": "b"}', {"en": "a", "hi": "b"}),
        ('Here you go:\n```json\n{"en": "a {x}", "hi": "b"}\n```', {"en": "a {x}", "hi": "b"}),
        ('{"en": "a"}', None),
        ('{"en": 1, "hi": "b"}', None),
        ("no json here", None),
    ])
    def test_parse_json_block(self, raw, expected):
        assert brief_mod._parse_json_block(raw) == expected


# ---- API ----


def test_brief_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    res = client.get("/api/brief", params={"festival": "Ganesh"})
    assert res.status_code == 200
    body = res.json()
    assert body["festival"] == "Ganesh"
    assert body["source"] in {"llm", "template"}
    assert client.get("/api/brief", params={"festival": "Holi"}).status_code == 400


class _FakeResponse:
    def __init__(self, body):
        self._body = body

    def raise_for_status(self):
        pass

    def json(self):
        return self._body


def _groq_body(content, finish_reason="stop"):
    return {"choices": [{"finish_reason": finish_reason,
                         "message": {"role": "assistant", "content": content}}]}


def test_groq_request_and_parse(monkeypatch):
    """Groq call sends the open-weight model with low reasoning and parses the JSON reply."""
    monkeypatch.setattr("app.config.GROQ_API_KEY", "test-key")
    monkeypatch.setattr("app.config.GROQ_MODEL", "openai/gpt-oss-120b")
    sent = {}

    def fake_post(url, headers, json, timeout):
        sent.update(url=url, headers=headers, body=json)
        return _FakeResponse(_groq_body('{"en": "E", "hi": "H"}'))

    monkeypatch.setattr(brief_mod.httpx, "post", fake_post)
    assert brief_mod._call_groq("FACTS: {}") == {"en": "E", "hi": "H"}
    assert sent["url"] == brief_mod.GROQ_URL
    assert sent["headers"]["Authorization"] == "Bearer test-key"
    assert sent["body"]["model"] == "openai/gpt-oss-120b"
    assert sent["body"]["reasoning_effort"] == "low"
    assert sent["body"]["include_reasoning"] is False


def test_groq_non_reasoning_model_has_no_reasoning_params(monkeypatch):
    monkeypatch.setattr("app.config.GROQ_API_KEY", "test-key")
    monkeypatch.setattr("app.config.GROQ_MODEL", "llama-3.3-70b-versatile")
    sent = {}

    def fake_post(url, headers, json, timeout):
        sent.update(json)
        return _FakeResponse(_groq_body('{"en": "E", "hi": "H"}'))

    monkeypatch.setattr(brief_mod.httpx, "post", fake_post)
    assert brief_mod._call_groq("FACTS: {}") == {"en": "E", "hi": "H"}
    assert "reasoning_effort" not in sent and "include_reasoning" not in sent


def test_groq_truncated_or_keyless_returns_none(monkeypatch):
    monkeypatch.setattr("app.config.GROQ_API_KEY", "test-key")
    monkeypatch.setattr(brief_mod.httpx, "post",
                        lambda *a, **k: _FakeResponse(_groq_body('{"en": "E"', "length")))
    assert brief_mod._call_groq("FACTS: {}") is None

    monkeypatch.setattr("app.config.GROQ_API_KEY", "")
    assert brief_mod._call_groq("FACTS: {}") is None


# ---------- D-21: recovery wording must not read as "clean" or "recovered" ----------


def test_brief_never_says_recovered_and_flags_still_above_limits():
    from app.brief import build_brief
    from app.scoring import rank_ghats

    for fest in ("Durga", "Ganesh"):
        b = build_brief(rank_ghats(fest), fest)
        low = b["en"].lower()
        assert "back to pre" not in low and "recovered" not in low and "clean" not in low
        assert b["numbers_validated"] is True
    durga = build_brief(rank_ghats("Durga"), "Durga")
    assert "Still above limits after." in durga["en"]
    assert "सीमा से ऊपर" in durga["hi"]


def test_good_recovery_splits_by_after_severity():
    from app.brief import build_facts

    base = {"rank": 1, "site": "X", "risk_level": "High", "quadrant": "already_bad",
            "confidence": {"level": "High", "reasons": []}, "evidence": [], "bmc_list_2026": "listed"}
    r = {"ranking": [dict(base, recovery="good", after_severity=0.4)], "no_data_sites": []}
    assert build_facts(r, "Durga")["top"][0]["recovery"] == "good_above_limits"
    r = {"ranking": [dict(base, recovery="good", after_severity=0.0)], "no_data_sites": []}
    assert build_facts(r, "Durga")["top"][0]["recovery"] == "good_within_limits"
    r = {"ranking": [dict(base, recovery="poor", after_severity=0.9)], "no_data_sites": []}
    assert build_facts(r, "Durga")["top"][0]["recovery"] == "poor"
