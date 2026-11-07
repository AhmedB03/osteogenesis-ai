"""Validated dimensionless configurations and wire contracts."""
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

Rate = Annotated[float, Field(ge=0, le=2)]
Fraction = Annotated[float, Field(ge=0, le=1)]
Activity = Annotated[float, Field(ge=0, le=4)]
Amount = Annotated[float, Field(ge=0, le=10)]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False, frozen=True)


class Signals(StrictModel):
    ihh: Activity = 1
    pthrp: Activity = 1
    bmp: Activity = 1
    fgf: Activity = 1
    wnt: Activity = 1
    gh_igf: Activity = 1


class Parameters(StrictModel):
    recruitment: Rate = 0.04
    proliferation: Rate = 0.25
    differentiation: Rate = 0.12
    hypertrophic_exit: Rate = 0.08
    matrix_deposition: Rate = 0.15
    mineralization: Rate = 0.10
    ossification: Rate = 0.08
    cell_death: Rate = 0.01
    tissue_turnover: Rate = 0.005
    senescence: Rate = 0.008
    scaffold_degradation: Rate = 0.025
    organization_repair: Rate = 0.06
    organization_loss: Rate = 0.02
    nutrient: Fraction = 0.85
    loading: Annotated[float, Field(ge=0, le=3)] = 0.6
    capacity: Annotated[float, Field(ge=0.01, le=20)] = 2


class Initial(StrictModel):
    resting: Amount = 0.8
    proliferating: Amount = 0.2
    hypertrophic: Amount = 0.05
    cartilage: Amount = 0.1
    mineralized: Amount = 0
    bone: Amount = 0
    scaffold: Fraction = 1
    organization: Fraction = 0.8
    competence: Fraction = 1


class SimulationConfig(StrictModel):
    model_version: Literal["0.1.0"] = "0.1.0"
    scenario: Literal["mature", "engineered"] = "engineered"
    duration: Annotated[float, Field(gt=0, le=200)] = 60
    samples: Annotated[int, Field(ge=2, le=1001, strict=True)] = 301
    parameters: Parameters = Field(default_factory=Parameters)
    signals: Signals = Field(default_factory=Signals)
    initial: Initial | None = None

    @model_validator(mode="after")
    def validate_mature(self) -> "SimulationConfig":
        if self.scenario == "mature" and self.initial is not None:
            if any(getattr(self.initial, k) != 0 for k in Initial.model_fields):
                raise ValueError("Mature baseline requires all initial compartments to be zero.")
        return self

    def resolved_initial(self) -> Initial:
        if self.initial is not None:
            return self.initial
        if self.scenario == "mature":
            return Initial(**dict.fromkeys(Initial.model_fields, 0))
        return Initial()


class Metrics(StrictModel):
    final_displacement: float
    final_bone: float
    final_organization: float
    functional_lifetime: float
    lifetime_right_censored: bool
    cell_balance_error: float
    tissue_balance_error: float


class SimulationResult(StrictModel):
    model_version: str
    run_id: str
    config: SimulationConfig
    units: dict[str, str]
    time: list[float]
    series: dict[str, list[float]]
    metrics: Metrics
    warnings: list[str]


SweepParameter = Literal["proliferation", "differentiation", "matrix_deposition", "ossification", "nutrient", "loading", "scaffold_degradation", "senescence"]


class SweepRequest(StrictModel):
    config: SimulationConfig = Field(default_factory=SimulationConfig)
    parameter: SweepParameter = "proliferation"
    values: Annotated[list[float], Field(min_length=2, max_length=16)]

    @model_validator(mode="after")
    def validate_values(self) -> "SweepRequest":
        for value in self.values:
            Parameters.model_validate({**self.config.parameters.model_dump(), self.parameter: value})
        return self


class SweepRow(StrictModel):
    value: float
    run_id: str
    metrics: Metrics
    warnings: list[str]


class SweepResult(StrictModel):
    request: SweepRequest
    rows: list[SweepRow]
    displacement_slope: float | None
    summary: str
