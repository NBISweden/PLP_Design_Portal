from pydantic import (
    BaseModel,
    TypeAdapter,
    field_validator,
    ValidationError,
    ValidationInfo,
    Field
)
from typing import Literal, Tuple, List, Annotated
import uuid
from .result_data import (
    Result,
    ErrorResult,
    FieldError,
    TableData,
    DeferredResult,
    StatusData,
    StatusEntry,
)
from .jobs import Job
from .result_manager import ResultManager
from plp_directrna_design.cli_utils import (
    parse_genes,
    parse_iupac_mismatches,
)
import os
import logging
from datetime import datetime


GENOME_LIST_PATH = os.getenv("PLP_GENOME_LIST_PATH", "genome_list.json")
JOBS_PATH = os.getenv("PLP_JOBS_PATH", "/tmp/jobs")
logger = logging.getLogger(__name__)


class PLPConfig(BaseModel):
    genome: str
    genes: set[str] = {"Grik2"}
    identifier_type: Literal["gene_name", "gene_id"] = "gene_name"
    plp_length: int = 30
    min_coverage: int = 0
    gc_min: int = 50
    gc_max: int = 65
    iupac_mismatches: List[Tuple[int, str]] = [(5, "R"), (10, "G")]
    max_errors: Annotated[int, Field(ge=1, le=6)] = 4
    tm_min: int = 58
    tm_max: int = 62
    lowest_percentile_tm_score_cutoff: Annotated[int, Field(ge=1, le=100)] = 5
    minimum_prope_distance: int = 8
    filter_ligation_junction: bool = True
    number_of_probes: int = 10
    off_target_output: bool = False
    check_probe_specificity: bool = False

    @field_validator("iupac_mismatches", mode="before", json_schema_input_type=str | List[Tuple[int, str]])
    @classmethod
    def validate_iupac_mismatches(
        cls, value: str | List[Tuple[int, str]]
    ) -> List[Tuple[int, str]]:
        if isinstance(value, str):
            return parse_iupac_mismatches(value)
        else:
            return value

    @field_validator("genes", mode="before", json_schema_input_type=str | set[str])
    @classmethod
    def validate_genes(
        cls, value: str | set[str]
    ) -> set[str]:
        if isinstance(value, str):
            return parse_genes(value)
        else:
            return value

    @field_validator("genome", mode="before")
    @classmethod
    def validate_genome(
        cls, value: str, info: ValidationInfo
    ) -> str:
        repository = (
            info.context.get("genome_repository")
            if info.context
            else None
        )
        if repository:
            repository.get(value)
        return value


class GenomeDataSet(BaseModel):
    id: str
    version: str
    fa_path: str
    gtf_path: str

    @property
    def fai_path(self):
        return f"{self.fa_path}.fai"


class GenomeRepository():
    def __init__(self, genome_list_path: str):
        self._genome_list_path = genome_list_path
        self._genome_list_ta = TypeAdapter(List[GenomeDataSet])

    def get_all(self) -> List[GenomeDataSet]:
        genome_list = self._load_genome_list()
        return genome_list

    def get(self, id: str) -> GenomeDataSet:
        genome_list = self._load_genome_list()
        return next(
            g
            for g in genome_list
            if g.id == id
        )

    def get_resource_path(self, path: str):
        genome_root = os.path.dirname(self._genome_list_path)
        return os.path.normpath(
            os.path.join(genome_root, path)
        )

    def _load_genome_list(self) -> List[GenomeDataSet]:
        try:
            with open(self._genome_list_path) as f:
                return self._genome_list_ta.validate_json(f.read())
        except FileNotFoundError:
            return []


PLPJob = Job[Literal["plp"], PLPConfig]


class PLPAdapter:
    name = "plp_search"

    def __init__(self, genome_repository: GenomeRepository, jobs_path: str):
        self._genome_repository = genome_repository
        self._jobs_path = jobs_path

    @property
    def info(self):
        return {
            "name": self.name,
            "description": "PLP Search",
            "version": "0.0.1"
        }

    @property
    def fields(self):
        return [
            {
                "id": "genome",
                "type": "choice",
                "options": [
                    genome.id
                    for genome in self._genome_repository.get_all()
                ]
            },
            {
                "id": "genes",
                "type": "text",
                "default": "Grik2"
            },
            {
                "id": "identifier_type",
                "type": "choice",
                "options": [
                    "gene_name",
                    "gene_id"
                ],
                "default": "gene_name"
            },
            {
                "id": "plp_length",
                "type": "number",
                "default": 30
            },
            {
                "id": "min_coverage",
                "type": "number",
                "default": 0
            },
            {
                "id": "gc_min",
                "type": "number",
                "default": 50
            },
            {
                "id": "gc_max",
                "type": "number",
                "default": 65
            },
            {
                "id": "iupac_mismatches",
                "default": "5:R,10:G",
                "type": "text",
            },
            {
                "id": "max_errors",
                "type": "choice",
                "options": [1, 2, 3, 4, 5, 6]
            },
            {
                "id": "tm_min",
                "type": "number",
                "default": 58
            },
            {
                "id": "tm_max",
                "type": "number",
                "default": 62,
            },
            {
                "id": "lowest_percentile_tm_score_cutoff",
                "type": "number",
                "default": 5
            },
            {
                "id": "minimum_prope_distance",
                "type": "number",
                "default": 8
            },
            {
                "id": "filter_ligation_junction",
                "type": "choice",
                "options": ["true", "false"],
                "default": "true"
            },
            {
                "id": "number_of_probes",
                "type": "number",
                "default": 10,
            },
            {
                "id": "off_target_output",
                "type": "choice",
                "options": ["true", "false"],
                "default": "false"
            },
            {
                "id": "check_probe_specificity",
                "type": "choice",
                "options": ["true", "false"],
                "default": "false"
            },
        ]

    @property
    def links(self):
        return [
            {
                "id": "github",
                "href": "https://github.com/NBISweden/PLP_Design_Portal",
                "icon": "fa-brands fa-github",
            }
        ]

    @property
    def translation(self):
        return {
            "en": {
                "translation": {
                    "results": {
                        "title": "Results",
                        "download_file": "Download '{{name}}'",
                        "default_title": "Result '{{id}}'",
                        "no_results": "No results available",
                    },
                    "form": {
                        "groups": {
                            "general": "General",
                            "extras": "Extras",
                            "find_targets": "Find Targets",
                            "extract_sequences": "Extract Sequences",
                            "extract_features": "Extract Features",
                        },
                        "content": {
                            "extras_info": "The following fields may cause the calculations to take significantly longer, so use with care."
                        },
                        "submit": "Launch analysis",
                        "show_example": "Show example"
                    },
                    "service": {
                        "title": "ISS Probe design",
                        "subtitle": "Design padlock probes for in-situ sequencing",
                        "waiting_for_results": "Waiting for ISS Probe results",
                    },
                    "fields": {
                        "genome.label": "Genome",
                        "genes.label": "Genes",
                        "identifier_type.label": "Identifier Type",
                        "plp_length.label": "PLP Length",
                        "min_coverage.label": "Minimum Coverage",
                        "gc_min.label": "GC Min",
                        "gc_max.label": "GC Max",
                        "number_of_probes.label": "Number of Probes",
                        "iupac_mismatches.label": "IUPAC Mismatches",
                        "max_errors.label": "Max Number of Errors",
                        "check_probe_specificity.label": "Check Probe Specificity",
                        "tm_min.label": "Tm Min",
                        "tm_max.label": "Tm Max",
                        "lowest_percentile_tm_score_cutoff.label": "Lowest percentile Tm Score Cutoff",
                        "minimum_prope_distance.label": "Minimum Probe Distance",
                        "filter_ligation_junction.label": "Filter Ligation Junction",
                        "off_target_output.label": "Off Target Output",
                    },
                    "links": {
                        "github": "View on GitHub"
                    }
                }
            }
        }

    @property
    def layout(self):
        return [
            {
                "id": "general",
                "fields": [
                    {
                        "type": "field",
                        "id": field_id,
                    }
                    for field_id in ["genome", "identifier_type"]
                ]
            },
            {
                "id": "extract_features",
                "fields": [
                    {
                        "type": "field",
                        "id": field_id,
                    }
                    for field_id in ["genes"]
                ]
            },
            {
                "id": "extract_sequences",
                "fields": [
                    {
                        "type": "field",
                        "id": field_id,
                    }
                    for field_id in ["plp_length"]
                ]
            },
            {
                "id": "find_targets",
                "fields": [
                    (
                        [
                            {
                                "type": "field",
                                "id": field_id,
                            }
                            for field_id in field_id_or_list
                        ]
                        if isinstance(field_id_or_list, list)
                        else {
                            "type": "field",
                            "id": field_id_or_list,
                        }
                    )
                    for field_id_or_list in [
                        "number_of_probes",
                        "iupac_mismatches",
                        "max_errors",
                        "min_coverage",
                        ["gc_min", "gc_max"],
                        ["tm_min", "tm_max"],
                        "lowest_percentile_tm_score_cutoff",
                        "minimum_prope_distance",
                        "filter_ligation_junction",
                    ]
                ]
            },
            {
                "id": "extras",
                "fields": [
                    {
                        "type": "content",
                        "id": "extras_info"
                    },
                    [
                        {
                            "type": "field",
                            "id": field_id,
                        }
                        for field_id in ["check_probe_specificity", "off_target_output"]
                    ]
                ]
            },
        ]

    def run(self, data, result_manager: ResultManager) -> Result | DeferredResult | ErrorResult:
        config, config_errors = self._parse_config(data)

        if config_errors is not None:
            return ErrorResult(
                label="Error",
                id=str(uuid.uuid4()),
                errors=[
                    FieldError(
                        fieldId=key,
                        id=error
                    )
                    for key, error in config_errors
                ]
            )

        date = datetime.now().isoformat()
        result_context = result_manager.create_context(label=f"PLP Service Result: {date}")
        result_context.set_item(
            TableData(
                id="plp-parameters",
                label="PLP Used Parameter",
                headers={
                    "value": "Value",
                    "param": "Param"
                },
                entries=[
                    {"param": param, "value": value}
                    for param, value in data.items()
                ]
            )
        )
        result_context.set_item(
            StatusData(
                id="plp-result",
                label="PLP Status",
                status=[
                    StatusEntry(
                        progress=0,
                        description="Waiting for worker to process job"
                    )
                ]
            )
        )
        self._submit(config, result_context.id)

        return result_context.get_result()

    def _submit(self, config, target: str):
        job: PLPJob = Job(
            id=self._get_job_id(),
            type="plp",
            timestamp=timestamp(),
            config=config,
            target=target
        )
        os.makedirs(self._jobs_path, exist_ok=True)
        with open(f"{self._jobs_path}/{job.id}", "w") as f:
            f.write(job.model_dump_json())

    def _get_job_id(self) -> str:
        return str(uuid.uuid4())

    def _abs_genome_path(self, path: str) -> str:
        genome_root = os.path.dirname(self._genome_list_path)
        return os.path.normpath(
            os.path.join(genome_root, path)
        )

    def _parse_config(self, data: dict) -> PLPConfig:
        try:
            config = PLPConfig.model_validate(
                data,
                context={"genome_repository": self._genome_repository}
            )
            return (config, None)
        except ValidationError as error:
            for e in error.errors():
                logger.warn(e)
            return (
                None,
                [(e["loc"][0], f"{e['msg']}: {e['type']}") for e in error.errors()]
            )

    def _noparse(self, data):
        return data

    def _parse_boolean(self, data):
        if not isinstance(data, str) and not isinstance(data, bool):
            raise ValueError("Input value type is incorrect")

        if isinstance(data, str):
            data = data.lower()

            if data not in {"true", "false"}:
                raise ValueError("Value must be 'true' or 'false'")

        return (
            data
            if isinstance(data, bool)
            else data == "true"
        )


def create_enum_parser(values: set[str]):
    def _parser(data):
        if not isinstance(data, str):
            raise ValueError("Value must be a string")

        if data not in values:
            raise ValueError(f"Value {data} is not in {values}")

        return data

    return _parser


def timestamp():
    return datetime.now().timestamp()


def create_adapter():
    return PLPAdapter(
        genome_repository=GenomeRepository(GENOME_LIST_PATH),
        jobs_path=JOBS_PATH
    )
