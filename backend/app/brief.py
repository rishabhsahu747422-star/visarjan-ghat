"""Bilingual brief generator.

Contract: the LLM only rephrases numbers computed by scoring.py. It never calculates or invents values.
A deterministic template fallback must always work so the demo cannot fail on an API error.
TODO (owner: LLM/Hindi lead).
"""


def build_brief(ranking: list[dict], festival: str) -> dict:
    raise NotImplementedError("Return {'en': str, 'hi': str, 'source': 'llm' | 'template'}")
