# Research roadmap

## Implemented foundation

- Deterministic compartment ODEs, modular signaling, validation and two scenarios.
- Separate cell/material balance diagnostics and structural bounds.
- Typed FastAPI simulations, presets, bounded one-factor sweeps and CSV/JSON exports.
- Next.js controls, Plotly trajectories, comparison, configuration save/load, raw data table and illustrative React Three Fiber long bone.
- Verified qualitative bibliography and explicit mathematical assumptions.

## Next engineering increments

1. Generate frontend contracts from OpenAPI; add schema compatibility checks. Current TypeScript definitions mirror Python manually.
2. Add experiment storage, cancellation and process-isolated jobs before multi-user deployment.
3. Replace endpoint secant summaries with named local finite-difference sensitivity/elasticity estimators, convergence checks and confidence reporting. Current sweep is one-factor exploration, not a full sensitivity-analysis module.
4. Add multi-parameter designs, ranked threshold summaries, solver cross-checks and uncertainty propagation. Version every change to equations and defaults.
5. Add calibrated unit mappings only alongside a documented calibration and validation protocol.

## Scientific development gates

1. **Literature-based calibration:** select an organism, age, anatomical site and assay. Extract quantitative time courses with uncertainty and provenance; assess parameter identifiability before fitting. Do not mix mouse development with adult human regeneration.
2. **Gene-expression module:** select publicly available growth plate single-cell datasets; verify accessions, licenses and metadata. Preserve raw counts, QC thresholds, batch effects and cell-label uncertainty. Distinguish descriptive markers from functional signaling. No accession is guessed or embedded in this MVP.
3. **Spatial models:** implement reaction-diffusion signaling and zone organization with mesh/timestep convergence. Compare against spatial measurements rather than schematic appearance.
4. **Mechanics:** introduce constitutive relations and loading/interface boundary conditions with experimental calibration. Separate cartilage expansion from actual bone displacement.
5. **Experimental collaboration:** agree on measurable outcomes, feasibility constraints, and appropriately reviewed tissue-engineering experiments with relevant specialists. Model validation is a collaboration, not an automatic consequence of software complexity.
6. **Predictive validation:** reserve independent datasets before fitting; predefine error metrics and report failed predictions. Compare against simpler baselines and quantify parameter and structural uncertainty.

No milestone here implies a workable adult regenerative treatment. The next useful research target is a narrow, independently testable developmental or tissue-culture behavior.
