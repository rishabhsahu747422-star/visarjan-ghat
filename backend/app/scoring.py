"""Scoring module (the core of the product). See docs/PROPOSED_SOLUTION.md section 4.

TODO (owner: data/scoring lead). Implement in this order, each with tests:
  1. phase_table(festival)        -> per ghat/year/parameter: pre, during, after (None when missing)
  2. impact_recovery(festival)    -> during-pre and after-pre per parameter, only when both values exist
  3. confidence(festival)         -> High / Medium / Low per ghat with reasons
  4. rank_ghats(festival)         -> ranked list with risk score, quadrant, reason inputs, source pages
  5. test_priority(festival)      -> risk x data-gap
Rules that must hold (see PRD section 6): missing is never clean; BDL is not zero; Durga and Ganesh never pooled.
"""
from .data_loader import load_readings  # noqa: F401


def rank_ghats(festival: str) -> list[dict]:
    raise NotImplementedError("Implement per docs/PROPOSED_SOLUTION.md section 4")
