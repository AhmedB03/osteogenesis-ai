# MVP verification record

Verified on 2026-11-06 with Python 3.12.6, NumPy 2.3.5, SciPy 1.16.1, Node 22.18.0, Next.js 16.4.5 and headless Microsoft Edge.

| Check | Result |
|---|---|
| Backend `python -m pytest -q` | 22 passed |
| Frontend `npm run build` | Production build passed |
| Frontend `npm run typecheck` | Strict TypeScript passed |
| Browser `npm test` | 5 passed against actual local API |
| Mobile follow-up | Passed at 375px after Plotly finished loading; no horizontal overflow |
| Desktop visual inspection | 1440px rendered dashboard, calculated curves and 3D schematic inspected |

The browser suite covers real simulation requests, rendered Plotly graphs, pinned comparison, mature baseline zero displacement, failed requests preserving prior results, invalid input feedback, sweep execution, configuration downloads and responsive layout. The 3D component has a failure boundary and textual fallback; this is not a mechanical validation.

The tests caught and resolved a collision between cumulative displacement and displacement-rate output names. The export endpoint now preserves cumulative displacement, and a regression check ties its endpoint to the summary metric. LSODA execution is serialized within each process because its integrator is not reentrant.

On this Windows environment, port 3000 binding was denied; browser tests used 3100. The sandbox prevented the first build's output-directory creation and stalled TestClient's local event loop. The final build and full API tests passed outside that sandbox with approved permissions. These environment limitations do not constitute numerical validation failures.

Default computational checks, not biological findings:

- Mature scenario: displacement 0, new bone index 0, functional lifetime 0.
- Engineered scenario at model time 60: displacement index 3.9800015795, new bone index 3.9026533656, organization proxy 0.641723. Lifetime is right-censored at 60.
- Engineered maximum cell/material ledger residuals were below 8e-15.

See `experiments/baseline-summary.json` for exact values, environment metadata and run IDs. Reproduce with `python experiments/run_baselines.py`. These values arise from assumed equations and constants; they are not observations or validated predictions.

The immediate implementation request is complete. Later-stage research needs are listed in [research_roadmap.md](research_roadmap.md). No hosted deployment was performed. Local development instructions are in [README.md](../README.md).
