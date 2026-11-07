# OsteoGenesis AI

A working research MVP for uncalibrated growth plate compartment simulations. **Computational thought experiments only.** Outputs do not demonstrate adult regeneration, predict height gains, or validate a treatment.

## Local development

Requires Python 3.12+ and Node.js 20.9+ (tested with Python 3.12.6 and Node 22.18). From this repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".\backend[test]"
.\.venv\Scripts\python -m uvicorn osteogenesis.api:app --reload --port 8000
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. If Windows denies port 3000, use `npm run dev -- --port 3100` and open http://localhost:3100; both origins are allowed by the API. Browser tests use port 3100. The API schema and interactive documentation are at http://127.0.0.1:8000/docs. Defaults use `http://127.0.0.1:8000`; optionally copy `frontend/.env.example` to `.env.local` and edit the URL. Restart/rebuild Next.js after changing it. Linux/macOS use `.venv/bin/python` in place of the Windows path.

Select a scenario, adjust controls and click **Run simulation**. Pin a completed run before changing parameters to compare dotted trajectories. Charts and exports always use the completed run's saved configuration. Reset only resets controls. Save/load configurations as JSON; JSON result exports include the resolved configuration, units, model version, run ID and warnings. CSV includes configuration metadata in each row. The 3D view is illustrative; playback is opt-in.

## Tests and production build

```powershell
cd backend
python -m pytest -q
cd ../frontend
npm run build
npm run typecheck
npm test
```

Use the virtual environment Python, or activate it so `python` resolves to it. Playwright's configuration starts a real API and production frontend automatically and uses installed Microsoft Edge. On systems without Edge, change `channel: "msedge"` to `channel: "chromium"` and run `npx playwright install chromium`. Tests cover success, failed requests, validation, comparison, sweep export, and mobile layout. Build first. `npm start` serves the production build; `npm run dev` is for development.

Generate deterministic example artifacts from the root:

```powershell
python experiments/run_baselines.py
```

## Architecture

```text
backend/osteogenesis/
  schemas.py       Pydantic input/output contracts and constraints
  signaling.py     Explicit phenomenological signal assumptions
  model.py         Compartment fluxes and derivatives
  solver.py        Integration, invariants and run identity
  experiments.py   Bounded one-factor sweeps
  api.py           REST transport and exports
backend/tests/     Engine and API regression/property tests
frontend/          Strict TypeScript Next.js, Tailwind, Plotly, R3F
docs/              Equations, evidence, limitations, roadmap
experiments/       Reproducible baseline configurations and summaries
```

The simulation package does not depend on the frontend or FastAPI. Numerical algorithms are separate from biological flux assumptions. Cells (resting, proliferating, hypertrophic) and material (cartilage, mineralized cartilage, new bone) have separate source/loss ledgers. Scaffold, organization, senescence and displacement are exploratory state variables. See [full equations and parameter registry](docs/mathematical_model.md).

## API

| Endpoint | Purpose |
|---|---|
| GET /health | Local service status |
| GET /presets | Mature and engineered configurations |
| POST /simulations | Execute a validated configuration |
| POST /experiments/sweep | One selected parameter, 2–16 values |
| POST /exports/json | Complete result with reproducibility metadata |
| POST /exports/csv | Time series plus run/version/config metadata |

Minimal request to `/simulations`: `{"scenario":"engineered","duration":60}`. Omitted fields take documented defaults. Invalid values and numerical failures return 422. Sweep example: `{"parameter":"nutrient","values":[0.2,0.5,0.8],"config":{"scenario":"engineered"}}`.

## Implemented and remaining

Phase 1 is implemented: ODE engine, signaling assumptions, baseline scenarios, dimensionless structural/displacement proxies, numerical checks and tests. Minimal API and dashboard are implemented, with selected later-phase features: exports, comparisons, one-factor sweeps and an illustrative 3D view.

Not implemented: biological calibration, experimental validation, spatial transport, real mechanics, gene-expression analysis, multi-parameter/global sensitivity analysis, a dedicated local elasticity estimator, durable experiment database, authentication or hosted deployment. No AI-generated biological conclusions are produced.

Start with [biological background](docs/biological_background.md), [verified sources](docs/sources.md), [limitations](docs/research_limitations.md), and [research roadmap](docs/research_roadmap.md).
