"""Golden tests: our numbers must reproduce the problem statement before we build on the data."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from app.data_loader import classify, load_readings  # noqa: E402
from app.limits import breach_severity  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def test_row_count():
    assert len(load_readings()) == 1524


def test_problem_statement_numbers():
    s = client.get("/api/summary").json()
    assert (s["do_readings"], s["do_below_5"]) == (116, 42)
    assert (s["bod_readings"], s["bod_above_3"]) == (112, 100)


def test_missing_is_never_clean():
    assert classify(None, "not sampled") == "missing"
    assert classify(None, "*") == "missing"
    assert classify(None, None) == "missing"


def test_bdl_is_not_missing_and_not_measured():
    assert classify(None, "BDL") == "below_detection"
    assert classify(None, "ND") == "below_detection"


def test_zero_do_is_a_measured_breach():
    assert classify(0.0, None) == "measured"
    assert breach_severity("Dissolved oxygen", 0.0) == 1.0


def test_within_limit_scores_zero():
    assert breach_severity("Dissolved oxygen", 6.0) == 0.0
    assert breach_severity("BOD", 2.0) == 0.0
    assert breach_severity("pH", 7.0) == 0.0


def test_seven_ghats():
    assert len(client.get("/api/ghats").json()["ghats"]) == 7


def test_ranking_endpoint_validates_festival():
    assert client.get("/api/ranking?festival=Holi").status_code == 400
