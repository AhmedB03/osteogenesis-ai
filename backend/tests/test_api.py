import csv
import io

from fastapi.testclient import TestClient

from osteogenesis.api import app
from osteogenesis.schemas import SimulationResult, SweepResult

client = TestClient(app)


def test_typed_simulation_and_presets():
    assert client.get("/health").json()["status"] == "ok"
    presets = client.get("/presets").json()
    response = client.post("/simulations", json=presets["engineered"])
    assert response.status_code == 200
    result = SimulationResult.model_validate(response.json())
    assert result.metrics.final_displacement > 0


def test_validation_and_exports():
    assert client.post("/simulations", json={"parameters": {"proliferation": -2}}).status_code == 422
    assert client.post("/simulations", json={"samples": 100000}).status_code == 422
    exported = client.post("/exports/json", json={"samples": 11}).json()
    result = SimulationResult.model_validate(exported)
    csv_response = client.post("/exports/csv", json=result.config.model_dump())
    rows = list(csv.DictReader(io.StringIO(csv_response.text)))
    assert len(rows) == 11
    assert rows[-1]["run_id"] == result.run_id
    assert float(rows[-1]["displacement"]) == result.metrics.final_displacement
    assert "config_json" in rows[-1]


def test_sweep_endpoint():
    response = client.post("/experiments/sweep", json={"values": [0.1, 0.3]})
    assert response.status_code == 200
    assert len(SweepResult.model_validate(response.json()).rows) == 2


def test_solver_failure_is_structured(monkeypatch):
    from osteogenesis.solver import SimulationError
    def fail(_config):
        raise SimulationError("Integrator failed")
    monkeypatch.setattr("osteogenesis.api.simulate", fail)
    response = client.post("/simulations", json={})
    assert response.status_code == 422
    assert response.json()["detail"] == "Integrator failed"
