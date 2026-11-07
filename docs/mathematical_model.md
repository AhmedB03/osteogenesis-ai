# Mathematical model v0.1.0

This is a deterministic, spatially lumped, uncalibrated ODE model. Every default number below is an illustrative modeling choice. None is fitted to human measurements. Time is dimensionless; rates are per model-time unit. Cell abundance and material are **different normalized quantities**, never summed into one conserved mass.

## State and initial conditions

| State | Meaning | Engineered initial value |
|---|---|---:|
| R | Resting chondrocyte abundance | 0.8 |
| P | Proliferating chondrocyte abundance | 0.2 |
| H | Hypertrophic chondrocyte abundance | 0.05 |
| C | Unmineralized cartilage matrix index | 0.1 |
| M | Mineralized cartilage index | 0 |
| B | Newly formed bone material index | 0 |
| S | Scaffold remaining fraction | 1 |
| O | Organization proxy | 0.8 |
| A | Proliferative competence / senescence proxy | 1 |
| D | Cumulative theoretical displacement index | 0 |

Four additional cumulative ledgers start at zero: cell input Ic, cell loss Lc, tissue input It, tissue loss Lt. Initial conditions for the mature baseline are **all zero**. B is newly formed material in the modeled compartment, not the amount of pre-existing mature bone. The engine rejects a nonzero initial state for the mature scenario.

## Signaling assumptions

User inputs uI, uQ, uBMP, uFGF, uWnt, uGH are in [0,4], default 1. GH/IGF is one combined modifier, not a model of endocrine regulation. Only IHH and PTHrP have state-dependent activity:

```
I = uI H / (0.1 + H)
Q = uQ R / (0.2 + R) (1 + I)
mp = (1 + 0.5 I + 0.5 uBMP + 0.5 uGH) / (1 + uFGF)
md = (1 + 0.5 uBMP + 0.25 uWnt) / (1 + Q)
```

H lumps pre-hypertrophic and hypertrophic signaling sources. Q introduces instantaneous feedback without spatial transport, delays or receptor dynamics. Constants 0.1, 0.2, 0.5 and 0.25 are arbitrary. The Wnt modifier only acts on P→H; it does not reproduce Wnt's distinct resting-zone effects. FGF lumps an inhibitory effect on proliferation; different ligands, stages and receptors are not represented. Zero pathway inputs leave basal proliferation/differentiation active. These are sensitivity knobs, not knockout or dose-response models.

## Fluxes and balances

Let n be nutrient availability, L be mechanical loading, K be cell capacity; k values are the parameters below.

```
jR = k_recruitment A n R
jP = k_proliferation mp n A P max(0, 1 - (R+P+H)/K)
jH = k_differentiation md P
jE = k_hypertrophic_exit H
jC = k_matrix_deposition n (P + 2H)
jM = k_mineralization C H/(0.1+H)
jB = k_ossification n M

R' = -jR - k_cell_death R
P' = jR + jP - jH - k_cell_death P
H' = jH - jE - k_cell_death H
C' = jC - jM - k_tissue_turnover C
M' = jM - jB - k_tissue_turnover M
B' = jB - k_tissue_turnover B

Ic' = jP
Lc' = k_cell_death (R+P+H) + jE
It' = jC
Lt' = k_tissue_turnover (C+M+B)
```

Material transfer C→M→B assumes unit normalized yield, with turnover as explicit loss. Cell differentiation transfers abundance R→P→H; cell exit does not transfer cell counts into bone mass. Production adds material from an implicit external supply. There is no nutrient mass conservation or explicit vascular/osteoblast compartment. Resting-cell self-renewal and chondrocyte lineage plasticity are deliberately omitted. This finite pool makes senescence partly structural.

Checks over the full raw solver trajectory:

```
(R+P+H)(t) - (R+P+H)(0) - Ic(t) + Lc(t) = 0
(C+M+B)(t) - (C+M+B)(0) - It(t) + Lt(t) = 0
```

## Structural and displacement assumptions

```
support = (S+C+M)/(0.2+S+C+M)
S' = -k_scaffold_degradation S
O' = k_organization_repair n support (1-O)
     - k_organization_loss (1+L^2) O
A' = -k_senescence A
stability = O support / (1+L^2)
expansion = jC + 2 jH
D' = expansion O stability     [engineered]
D' = 0                        [mature]
thickness = C + M + P + 3H
```

The factors 2 and 3 are assumed relative hypertrophic size contributions. Thickness is a mixed, weighted **geometric proxy**, not a measured length; it excludes scaffold and mature bone. `expansion` is gross production, not d(thickness)/dt. Material replacement does not add displacement a second time. D accumulates gross organized expansion without recoil and cannot prove retained bone elongation. Stability is a proxy, not stress, stiffness or a safety factor. Organization may recover even without cells if scaffold exists; therefore it must never be interpreted as proof of a viable growth plate by itself.

Functional lifetime is the first **sampled** model time at which any criterion fails: O≥0.5, A≥0.2, P+H≥0.01. These thresholds are arbitrary. Initial failure gives zero. If no failure occurs, lifetime is right-censored at the run duration, displayed with ≥. A first failure ends this metric even if the system later recovers. Its resolution depends on output sampling. D is not gated by these thresholds; low-proxy expansion can continue after functional lifetime ends.

## Parameter registry

All rates have allowed range [0,2]. Bounds are computational guardrails, not physiological bounds.

| Parameter | Default | Meaning |
|---|---:|---|
| recruitment | .04 | R→P transfer |
| proliferation | .25 | Basal P expansion |
| differentiation | .12 | P→H transfer |
| hypertrophic_exit | .08 | H removal |
| matrix_deposition | .15 | Matrix production |
| mineralization | .10 | C→M transfer |
| ossification | .08 | M→B replacement |
| cell_death | .01 | Loss from each cell pool |
| tissue_turnover | .005 | Loss from C, M, B |
| senescence | .008 | Competence decay |
| scaffold_degradation | .025 | Scaffold decay |
| organization_repair | .06 | Recovery toward organization 1 |
| organization_loss | .02 | Load-modulated loss |
| nutrient | .85 | Fixed availability, [0,1] |
| loading | .60 | Fixed loading index, [0,3] |
| capacity | 2 | Cell abundance crowding scale, [.01,20] |

Initial cell/material states are bounded [0,10]; S, O, A are bounded [0,1]. Duration is (0,200], samples are integer [2,1001]. No coefficient has experimental provenance beyond a qualitative relationship. Valid inputs can still describe implausible tissue.

## Numerical methods and reproducibility

SciPy `solve_ivp`, LSODA, rtol=1e-8, atol=1e-10, maximum internal step .25. Adaptive integration is independent of uniform output sampling. Fluxes evaluate states with max(y,0) to protect trial-stage reaction rates. At nonnegative boundaries, each physical state has a nonnegative derivative; S, O, A stay within [0,1] analytically. After integration, reject solver failure, incomplete output, nonfinite values, raw negatives below -1e-7, values above 1e6, structural states above 1+1e-7, or absolute ledger residuals above 1e-6. Only then clamp tiny negative roundoff to zero. Balance diagnostics are computed before clamping.

Warnings flag cell abundance above 1.01K, final organization below .5, and cartilage burden above 5. These are assumption checks, not validated biological plausibility classifiers. The API caps sweep size at 16 runs. It is a local research service, without public multi-user scheduling or concurrency guarantees.

Run IDs hash canonical JSON containing resolved initial conditions and model version. Deterministic ODEs need no random seed. Randomized property tests use seed 2718. Exact bitwise reproducibility is expected only within the same dependency/platform environment; compare tolerances across platforms. Changing equations requires a model version increment. Unit metadata is separate from the solver; physical calibration would require an explicit scaling layer, dimensional analysis and validation, not merely relabeling indices.
