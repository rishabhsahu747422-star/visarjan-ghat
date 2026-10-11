"""CPCB Class B (outdoor bathing) limits used for risk scoring. See docs/DECISIONS.md D-02."""
from dataclasses import dataclass


@dataclass(frozen=True)
class Limit:
    parameter: str
    unit: str
    min: float | None = None  # reading must be >= min
    max: float | None = None  # reading must be <= max


CLASS_B = {
    "Dissolved oxygen": Limit("Dissolved oxygen", "mg/l", min=5.0),
    "BOD": Limit("BOD", "mg/l", max=3.0),
    "pH": Limit("pH", "", min=6.5, max=8.5),
}

# Parameters shown as context only: no Class B limit exists. Never shown as a violation.
CONTEXT_ONLY = [
    "COD", "Total solids", "Dissolved solids", "Suspended solids", "Turbidity",
    "Conductivity", "Chromium", "Lead", "Zinc", "Copper",
]


def breach_severity(parameter: str, value: float) -> float:
    """0 = within limit. Otherwise the fractional distance past the limit, capped at 1.

    DO: (5 - v) / 5      BOD: (v - 3) / 3      pH: distance outside 6.5-8.5, per 1.0 unit
    v0 formula: tune and record any change in docs/DECISIONS.md.
    """
    lim = CLASS_B.get(parameter)
    if lim is None:
        raise KeyError(f"No Class B limit for {parameter!r}")
    if parameter == "Dissolved oxygen":
        s = (lim.min - value) / lim.min
    elif parameter == "BOD":
        s = (value - lim.max) / lim.max
    else:  # pH
        s = max(lim.min - value, value - lim.max, 0.0) / 1.0
    return max(0.0, min(1.0, s))
