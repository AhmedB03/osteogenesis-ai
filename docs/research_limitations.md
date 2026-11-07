# What this model cannot establish

This application does not demonstrate growth plate regeneration or controlled adult human bone lengthening. It does not recommend interventions. Its dimensionless displacement cannot be converted into millimeters or human height gains.

Scenario A fixes the growth plate compartment to zero. Zero growth is therefore a structural negative control, not a discovery or clinical proof. Scenario B assumes tissue already exists with specified composition and organization. It does not explain how cartilage could integrate into, separate, or displace intact mature bone. Surgical access, interfaces and boundary conditions would require separate modeling and experimental investigation.

Important omissions include spatial gradients, oriented cell columns, vascular invasion, immune reactions, osteoclasts and osteoblast populations, lineage plasticity, endocrine dynamics, sex steroids, scaffold constitutive mechanics, mineral material properties, tissue interfaces, oxygen consumption and diffusion. Nutrient availability is a constant external modifier. Mechanical stability is a bounded scalar proxy with no relation to failure load. Scaffold and tissue remodeling are not experimentally calibrated.

GH/IGF is lumped; Wnt and FGF are context-dependent families reduced to simple modifiers. Signal inputs are neither concentrations nor gene-expression measurements. Increasing a control cannot be interpreted as a feasible, safe or efficacious intervention.

Numerical validation checks the computation, not the biology. Positivity, balanced bookkeeping and reproducible trajectories do not establish predictive validity. Default parameters were selected for tractable illustrative behavior; plausible-looking curves are not evidence. Warnings use arbitrary thresholds. Functional lifetime is sampling-dependent and right-censored if the run ends first. A positive D can coexist with organization failure because the displacement formula is smooth and not gated by a clinical criterion.

The model is non-identifiable without independent data: multiple rates can produce similar curves. Local sweeps are conditional on all other assumptions. They are neither global uncertainty quantification nor causal estimates. No biological prediction accuracy has been measured. Parameter provenance and validation failures must remain visible in future versions.

The API is intended for local trusted use. It has no authentication, persistent database, background worker queue, deployment hardening or public multi-user capacity guarantee. LSODA must not be used concurrently within a process without serialization; the API serializes numerical work. Requests and output sizes are bounded, but a production service needs load testing and job admission control.
