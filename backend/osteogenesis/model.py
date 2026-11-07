"""Biological assumptions and fluxes. No solver or presentation dependencies."""
import numpy as np
from numpy.typing import NDArray

from .schemas import SimulationConfig
from .signaling import activities, modifiers

STATE_NAMES = ("resting", "proliferating", "hypertrophic", "cartilage", "mineralized", "bone", "scaffold", "organization", "competence", "displacement", "cell_input", "cell_loss", "tissue_input", "tissue_loss")


def fluxes(y: NDArray[np.float64], cfg: SimulationConfig) -> dict[str, float]:
    r, p, h, c, m, b, s, o, a = np.maximum(y[:9], 0)
    par = cfg.parameters
    signal = activities(cfg.signals, float(r), float(h))
    pm, dm = modifiers(signal)
    birth = par.proliferation * pm * par.nutrient * a * p * max(0, 1-(r+p+h)/par.capacity)
    recruit = par.recruitment * a * par.nutrient * r
    differentiate = par.differentiation * dm * p
    exit_h = par.hypertrophic_exit * h
    deposition = par.matrix_deposition * par.nutrient * (p + 2*h)
    mineralize = par.mineralization * c * h/(0.1+h)
    ossify = par.ossification * par.nutrient * m
    support = (s+c+m)/(0.2+s+c+m)
    stability = o * support / (1+par.loading**2)
    expansion = deposition + 2*differentiate
    displacement = expansion * o * stability if cfg.scenario == "engineered" else 0.0
    return dict(birth=birth, recruit=recruit, differentiate=differentiate, exit_h=exit_h,
                deposition=deposition, mineralize=mineralize, ossify=ossify,
                stability=stability, expansion=expansion, displacement_rate=displacement,
                support=support, **{f"signal_{k}": v for k, v in signal.items()})


def derivative(_t: float, y: NDArray[np.float64], cfg: SimulationConfig) -> NDArray[np.float64]:
    r, p, h, c, m, b, s, o, a = np.maximum(y[:9], 0)
    q, par = fluxes(y, cfg), cfg.parameters
    death = par.cell_death
    turnover = par.tissue_turnover
    organization_change = par.organization_repair*par.nutrient*q["support"]*(1-o) - par.organization_loss*(1+par.loading**2)*o
    return np.array([
        -q["recruit"]-death*r,
        q["recruit"]+q["birth"]-q["differentiate"]-death*p,
        q["differentiate"]-q["exit_h"]-death*h,
        q["deposition"]-q["mineralize"]-turnover*c,
        q["mineralize"]-q["ossify"]-turnover*m,
        q["ossify"]-turnover*b,
        -par.scaffold_degradation*s, organization_change, -par.senescence*a,
        q["displacement_rate"], q["birth"], death*(r+p+h)+q["exit_h"],
        q["deposition"], turnover*(c+m+b),
    ], dtype=float)
