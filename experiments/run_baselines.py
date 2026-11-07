"""Run from repository root: python experiments/run_baselines.py."""
import json
import platform
import sys
from pathlib import Path

import numpy
import scipy

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from osteogenesis.schemas import SimulationConfig, SweepRequest
from osteogenesis.solver import simulate
from osteogenesis.experiments import sweep

output = Path(__file__).resolve().parent
summary = {"python": platform.python_version(), "numpy": numpy.__version__, "scipy": scipy.__version__, "runs": {}}
for scenario in ("mature", "engineered"):
    result = simulate(SimulationConfig(scenario=scenario))
    (output / f"{scenario}.config.json").write_text(result.config.model_dump_json(indent=2), encoding="utf-8")
    summary["runs"][scenario] = {"run_id": result.run_id, "metrics": result.metrics.model_dump(), "warnings": result.warnings}
request = SweepRequest(values=[.1, .25, .4])
(output / "proliferation-sweep.json").write_text(sweep(request).model_dump_json(indent=2), encoding="utf-8")
(output / "baseline-summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
print(json.dumps(summary, indent=2))
