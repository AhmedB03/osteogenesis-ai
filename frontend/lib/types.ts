export type Scenario = "mature" | "engineered";
export type Signals = { ihh: number; pthrp: number; bmp: number; fgf: number; wnt: number; gh_igf: number };
export type Parameters = { recruitment: number; proliferation: number; differentiation: number; hypertrophic_exit: number; matrix_deposition: number; mineralization: number; ossification: number; cell_death: number; tissue_turnover: number; senescence: number; scaffold_degradation: number; organization_repair: number; organization_loss: number; nutrient: number; loading: number; capacity: number };
export type Initial = { resting: number; proliferating: number; hypertrophic: number; cartilage: number; mineralized: number; bone: number; scaffold: number; organization: number; competence: number };
export type Config = { model_version: "0.1.0"; scenario: Scenario; duration: number; samples: number; parameters: Parameters; signals: Signals; initial: Initial | null };
export type Metrics = { final_displacement: number; final_bone: number; final_organization: number; functional_lifetime: number; lifetime_right_censored: boolean; cell_balance_error: number; tissue_balance_error: number };
export type Result = { model_version: string; run_id: string; config: Config; units: Record<string, string>; time: number[]; series: Record<string, number[]>; metrics: Metrics; warnings: string[] };
export const initial: Initial = { resting: .8, proliferating: .2, hypertrophic: .05, cartilage: .1, mineralized: 0, bone: 0, scaffold: 1, organization: .8, competence: 1 };
export const defaults: Config = { model_version: "0.1.0", scenario: "engineered", duration: 60, samples: 301, initial: null,
  parameters: { recruitment: .04, proliferation: .25, differentiation: .12, hypertrophic_exit: .08, matrix_deposition: .15, mineralization: .1, ossification: .08, cell_death: .01, tissue_turnover: .005, senescence: .008, scaffold_degradation: .025, organization_repair: .06, organization_loss: .02, nutrient: .85, loading: .6, capacity: 2 },
  signals: { ihh: 1, pthrp: 1, bmp: 1, fgf: 1, wnt: 1, gh_igf: 1 } };
export type Sweep = { request: unknown; rows: { value: number; run_id: string; metrics: Metrics; warnings: string[] }[]; displacement_slope: number | null; summary: string };
