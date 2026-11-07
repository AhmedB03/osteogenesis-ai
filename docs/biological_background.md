# Biological background and evidence boundaries

Growth plates organize cartilage into resting, proliferative and hypertrophic regions. Chondrocytes divide and enlarge; cartilage matrix is remodeled and mineralized as bone formation advances through endochondral ossification. A cell count is not a volume or a bone mass. OsteoGenesis consequently models cell abundance separately from material compartments.

Mouse lineage tracing identifies PTHrP-positive resting-zone cells that supply columnar chondrocytes [Mizuhashi et al., 2018](https://doi.org/10.1038/s41586-018-0662-5). This supports a resting-pool source in a developmental model; it does not establish an adult human regenerative implant. The MVP omits resting-cell self-renewal and uses a finite starting pool.

| Relationship | Evidence supported direction/context | MVP simplification |
|---|---|---|
| IHH–PTHrP | Developmental experiments support feedback regulating differentiation; PTHrP delays hypertrophy | Instantaneous saturating H→IHH→PTHrP feedback and inhibition of P→H |
| BMP / FGF | Mouse genetic studies support roles in proliferation, differentiation and pathway antagonism | BMP increases proliferation/differentiation modifiers; FGF reduces proliferation only |
| Wnt | Mouse experiments show resting-cell maintenance is sensitive to Wnt activation; effects depend on compartment | A hypothetical positive modifier of P→H only; resting-zone inhibition is not modeled |
| GH / IGF-1 | Chondrocyte IGF-1R experiments support roles in normal growth plate development | One combined positive proliferation modifier, no endocrine feedback |
| Senescence | [Rabbit studies](https://pubmed.ncbi.nlm.nih.gov/16614378/) associate senescence with resting-pool changes; species and developmental stage matter | Finite resting pool plus exponential competence decay |
| Engineered integration | No study cited here demonstrates the proposed adult human outcome | An existing compartment is assumed; no implantation, integration or bone separation mechanism |

The [IHH–PTHrP study](https://pubmed.ncbi.nlm.nih.gov/8662546/) motivates a feedback direction, not our numerical curve. [BMP/FGF experiments](https://pubmed.ncbi.nlm.nih.gov/17065231/) motivate interacting pathways but not a universal scalar for each ligand family. [Resting-zone Wnt experiments](https://doi.org/10.7554/eLife.64513) specifically caution against interpreting increasing Wnt as uniformly beneficial. The [IGF-1R study](https://pmc.ncbi.nlm.nih.gov/articles/PMC3530140/) motivates including IGF-related effects while providing no basis for reconstructing a missing plate by raising hormone signaling.

There is no hypothesis testing against biological data in v0.1.0. Positive simulated displacement follows the chosen equations. The equations, constants and initial values must be challenged and calibrated independently before predictive claims are appropriate. See [sources](sources.md), [equations](mathematical_model.md), and [limitations](research_limitations.md).
