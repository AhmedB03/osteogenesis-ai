import numpy as np
import pytest
from pydantic import ValidationError

from osteogenesis.model import derivative, fluxes
from osteogenesis.schemas import Initial, Parameters, Signals, SimulationConfig, SweepRequest
from osteogenesis.solver import simulate
from osteogenesis.experiments import sweep


@pytest.mark.parametrize("scenario", ["mature", "engineered"])
def test_finite_nonnegative_reproducible_balanced(scenario):
    config = SimulationConfig(scenario=scenario)
    result = simulate(config)
    data = np.array(list(result.series.values()))
    assert np.isfinite(data).all()
    assert data.min() >= 0
    assert result == simulate(config)
    assert result.metrics.cell_balance_error < 1e-7
    assert result.metrics.tissue_balance_error < 1e-7
    assert len(result.time) == config.samples
    assert result.series["displacement"][-1] == result.metrics.final_displacement
    assert result.series["bone"][-1] == result.metrics.final_bone


@pytest.mark.parametrize("activity", [0, 1, 4])
def test_mature_cannot_grow_from_signaling(activity):
    result = simulate(SimulationConfig(scenario="mature", signals=Signals(gh_igf=activity, bmp=activity)))
    for name in ("displacement", "bone", "cartilage", "resting", "proliferating", "hypertrophic"):
        assert set(result.series[name]) == {0.0}
    assert result.metrics.functional_lifetime == 0


def test_signal_directions_at_fixed_state():
    y = np.array([0.8, 0.2, 0.05, 0.1, 0, 0, 1, .8, 1, 0, 0, 0, 0, 0])
    base = fluxes(y, SimulationConfig())
    assert fluxes(y, SimulationConfig(signals=Signals(fgf=4)))["birth"] < base["birth"]
    assert fluxes(y, SimulationConfig(signals=Signals(gh_igf=4)))["birth"] > base["birth"]
    assert fluxes(y, SimulationConfig(signals=Signals(pthrp=4)))["differentiate"] < base["differentiate"]


def test_derivative_ledgers_and_boundary_positivity():
    rng = np.random.default_rng(2718)
    for _ in range(50):
        y = rng.uniform(0, 1, 14)
        dy = derivative(0, y, SimulationConfig())
        assert dy[:3].sum() == pytest.approx(dy[10]-dy[11])
        assert dy[3:6].sum() == pytest.approx(dy[12]-dy[13])
        for index in range(10):
            boundary = y.copy()
            boundary[index] = 0
            assert derivative(0, boundary, SimulationConfig())[index] >= 0


@pytest.mark.parametrize("kwargs", [{"proliferation": -1}, {"nutrient": 2}, {"loading": float("nan")}, {"capacity": 0}, {"invented": 2}])
def test_invalid_parameters(kwargs):
    with pytest.raises(ValidationError):
        Parameters(**kwargs)


def test_mature_rejects_tissue_and_bad_duration():
    with pytest.raises(ValidationError):
        SimulationConfig(scenario="mature", initial=Initial())
    with pytest.raises(ValidationError):
        SimulationConfig(duration=0)


def test_nutrients_and_proliferation_affect_results():
    base = simulate(SimulationConfig())
    starved = simulate(SimulationConfig(parameters=Parameters(nutrient=0)))
    slow = simulate(SimulationConfig(parameters=Parameters(proliferation=0)))
    assert starved.metrics.final_bone == 0
    assert slow.metrics.final_bone < base.metrics.final_bone
    assert max(starved.series["deposition"]) == 0


def test_zero_tissue_and_organization_limit_growth():
    result = simulate(SimulationConfig(initial=Initial(**dict.fromkeys(Initial.model_fields, 0))))
    assert result.metrics.final_displacement == 0
    result = simulate(SimulationConfig(initial=Initial(organization=0), parameters=Parameters(organization_repair=0)))
    assert result.metrics.final_displacement == 0


def test_sweep_is_reproducible_and_validated():
    request = SweepRequest(values=[0, .25, .5])
    result = sweep(request)
    assert result == sweep(request)
    assert len({row.run_id for row in result.rows}) == 3
    assert result.displacement_slope is not None
    with pytest.raises(ValidationError):
        SweepRequest(parameter="nutrient", values=[0, 2])


def test_extreme_valid_parameters_and_long_duration():
    result = simulate(SimulationConfig(duration=200, parameters=Parameters(proliferation=2, differentiation=2, mineralization=2, loading=3)))
    assert np.isfinite(np.array(list(result.series.values()))).all()
    assert max(result.series["organization"]) <= 1


def test_sampling_does_not_change_terminal_state():
    a = simulate(SimulationConfig(samples=41))
    b = simulate(SimulationConfig(samples=501))
    assert a.metrics.final_displacement == pytest.approx(b.metrics.final_displacement, rel=1e-7)
