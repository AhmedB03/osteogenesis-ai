"""Phenomenological modifiers; constants are assumptions, not fitted biology."""
from .schemas import Signals


def activities(signals: Signals, resting: float, hypertrophic: float) -> dict[str, float]:
    ihh = signals.ihh * hypertrophic / (0.1 + hypertrophic)
    pthrp = signals.pthrp * resting / (0.2 + resting) * (1 + ihh)
    return {**signals.model_dump(), "ihh": ihh, "pthrp": pthrp}


def modifiers(activity: dict[str, float]) -> tuple[float, float]:
    a = activity
    proliferation = (1 + 0.5*a["ihh"] + 0.5*a["bmp"] + 0.5*a["gh_igf"]) / (1 + a["fgf"])
    differentiation = (1 + 0.5*a["bmp"] + 0.25*a["wnt"]) / (1 + a["pthrp"])
    return proliferation, differentiation
