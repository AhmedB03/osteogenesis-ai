"""Numerical integration, invariants, and reproducibility metadata."""
import hashlib
import json
from threading import Lock

import numpy as np
from scipy.integrate import solve_ivp

from . import MODEL_VERSION
from .model import STATE_NAMES, derivative, fluxes
from .schemas import Metrics, SimulationConfig, SimulationResult


class SimulationError(RuntimeError):
    """A trajectory failed numerical or accounting validation."""


_solver_lock = Lock()  # SciPy's LSODA integrator is not reentrant within a process.


def simulate(config: SimulationConfig) -> SimulationResult:
    with _solver_lock:
        return _simulate(config)


def _simulate(config: SimulationConfig) -> SimulationResult:
    initial = config.resolved_initial()
    config = SimulationConfig.model_validate({**config.model_dump(), "initial": initial.model_dump()})
    y0 = np.array([getattr(initial, k) for k in STATE_NAMES[:9]] + [0.0]*5)
    time = np.linspace(0, config.duration, config.samples)
    solution = solve_ivp(lambda t, y: derivative(t, y, config), (0, config.duration), y0,
                         t_eval=time, method="LSODA", rtol=1e-8, atol=1e-10, max_step=0.25)
    if not solution.success or solution.y.shape[1] != len(time):
        raise SimulationError("Integrator failed to complete the requested interval.")
    raw = solution.y
    if not np.isfinite(raw).all() or np.min(raw) < -1e-7 or np.max(raw) > 1e6:
        raise SimulationError("Non-finite, materially negative, or excessive trajectory.")
    cell_error = float(np.max(np.abs(raw[:3].sum(axis=0)-y0[:3].sum()-raw[10]+raw[11])))
    tissue_error = float(np.max(np.abs(raw[3:6].sum(axis=0)-y0[3:6].sum()-raw[12]+raw[13])))
    if max(cell_error, tissue_error) > 1e-6:
        raise SimulationError("Compartment balance check failed.")
    if np.max(raw[6:9]) > 1+1e-7:
        raise SimulationError("Bounded structural state exceeded one.")
    y = np.maximum(raw, 0)  # Only remove roundoff after checking raw values and balances.
    series = {name: y[i].tolist() for i, name in enumerate(STATE_NAMES)}
    flux = [fluxes(column, config) for column in y.T]
    for key in flux[0]:
        series[key] = [float(row[key]) for row in flux]
    series["thickness"] = (y[3]+y[4]+y[1]+3*y[2]).tolist()
    functional = (y[7] >= 0.5) & (y[8] >= 0.2) & ((y[1]+y[2]) >= 0.01)
    failures = np.flatnonzero(~functional)
    lifetime = float(time[failures[0]]) if len(failures) else config.duration
    warnings = ["Computational thought experiment: uncalibrated dimensionless indices; not a prediction of human growth."]
    if np.max(y[:3].sum(axis=0)) > config.parameters.capacity*1.01:
        warnings.append("Cell abundance exceeds the assumed capacity; inspect initial conditions.")
    if y[7, -1] < 0.5 and config.scenario == "engineered":
        warnings.append("Final organization falls below the assumed functional threshold (0.5).")
    if np.max(y[3]+y[4]) > 5:
        warnings.append("Cartilage burden exceeds an arbitrary plausibility screen of 5; inspect turnover assumptions.")
    canonical = json.dumps(config.model_dump(), sort_keys=True, separators=(",", ":"))
    return SimulationResult(model_version=MODEL_VERSION, run_id=hashlib.sha256(canonical.encode()).hexdigest()[:16],
        config=config, units={"time": "dimensionless model time", "populations": "normalized cell abundance",
        "tissue": "normalized material index", "displacement": "dimensionless displacement index"},
        time=time.tolist(), series=series, warnings=warnings,
        metrics=Metrics(final_displacement=float(y[9,-1]), final_bone=float(y[5,-1]), final_organization=float(y[7,-1]),
                        functional_lifetime=lifetime, lifetime_right_censored=not len(failures),
                        cell_balance_error=cell_error, tissue_balance_error=tissue_error))
