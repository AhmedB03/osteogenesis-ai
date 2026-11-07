"""Small local research API. CPU work runs off the async event loop."""
from typing import Literal

import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from .experiments import sweep
from .schemas import SimulationConfig, SimulationResult, SweepRequest, SweepResult
from .solver import SimulationError, simulate

app = FastAPI(title="OsteoGenesis AI", version="0.1.0", description="Uncalibrated computational thought experiments.")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3100", "http://127.0.0.1:3100"], allow_methods=["GET", "POST"], allow_headers=["Content-Type"])


@app.exception_handler(SimulationError)
async def simulation_error(_request: Request, exc: SimulationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model_version": "0.1.0"}


@app.get("/presets", response_model=dict[str, SimulationConfig])
def presets() -> dict[str, SimulationConfig]:
    return {name: SimulationConfig(scenario=name) for name in ("mature", "engineered")}


@app.post("/simulations", response_model=SimulationResult)
def run_simulation(config: SimulationConfig) -> SimulationResult:
    return simulate(config)


@app.post("/experiments/sweep", response_model=SweepResult)
def run_sweep(request: SweepRequest) -> SweepResult:
    return sweep(request)


@app.post("/exports/{format}")
def export_simulation(format: Literal["csv", "json"], config: SimulationConfig) -> Response:
    result = simulate(config)
    if format == "json":
        return Response(result.model_dump_json(indent=2), media_type="application/json",
                        headers={"Content-Disposition": f'attachment; filename="{result.run_id}.json"'})
    frame = pd.DataFrame({"time": result.time, **result.series})
    frame["run_id"] = result.run_id
    frame["model_version"] = result.model_version
    frame["config_json"] = result.config.model_dump_json()
    return Response(frame.to_csv(index=False), media_type="text/csv",
                    headers={"Content-Disposition": f'attachment; filename="{result.run_id}.csv"'})
