"""Bounded one-factor sweeps with reproducible configurations."""
from .schemas import SimulationConfig, SweepRequest, SweepResult, SweepRow
from .solver import simulate


def sweep(request: SweepRequest) -> SweepResult:
    rows = []
    for value in request.values:
        data = request.config.model_dump()
        data["parameters"][request.parameter] = value
        result = simulate(SimulationConfig.model_validate(data))
        rows.append(SweepRow(value=value, run_id=result.run_id, metrics=result.metrics, warnings=result.warnings))
    ordered = sorted(rows, key=lambda row: row.value)
    delta = ordered[-1].value-ordered[0].value
    slope = (ordered[-1].metrics.final_displacement-ordered[0].metrics.final_displacement)/delta if delta else None
    return SweepResult(request=request, rows=rows, displacement_slope=slope,
                       summary="One-factor exploration. Slope is an endpoint secant, not causal evidence or a calibrated sensitivity.")
