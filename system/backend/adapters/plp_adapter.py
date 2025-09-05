from dataclasses import dataclass
from typing import Literal
from .result_data import (
    Result,
    ErrorResult,
    FieldError,
    TableData,
    DeferredResult,
    StatusData,
    StatusEntry,
)
from .result_manager import ResultManager, ResultContext
from plp_directrna_design.cli_utils import (
    extract_features,
    extract_mrna,
    extract_sequences,
    find_targets,
    parse_genes,
    parse_iupac_mismatches,
)
from multiprocessing import Lock
from concurrent.futures import ProcessPoolExecutor
import os
import json
import tempfile
import logging
import contextlib
from datetime import datetime
import functools
from uuid import uuid4


GENOME_LIST_PATH = os.getenv("PLP_GENOME_LIST_PATH", "genome_list.json")
DEFERRED_RESULT_PATH = os.getenv("PLP_DEFERRED_RESULT_PATH", "/tmp")
logger = logging.getLogger(__name__)


@dataclass
class Config:
    genome: str
    genes: str = "Grik2"
    identifier_type: Literal["gene_name", "gene_id"] = "gene_name"
    plp_length: int = 30
    min_coverage: int = 0
    gc_min: int = 50
    gc_max: int = 65
    iupac_mismatches: str = "5:R,10:G"
    max_errors: Literal[1, 2, 3, 4, 5, 6] = 4
    tm_min: int = 58
    tm_max: int = 62
    lowest_percentile_tm_score_cutoff: int = 5  # 1 to 100
    minimum_prope_distance: int = 8
    filter_ligation_junction: bool = True
    number_of_probes: int = 10
    off_target_output: bool = False
    check_probe_specificity: bool = False


@dataclass
class GenomeDataSet:
    id: str
    version: str
    fa_path: str
    gtf_path: str


@functools.cache
def get_id_lock(id: str):
    return Lock()


class PLPAdapter:
    name = "plp_search"

    def __init__(self, genome_list_path: str):
        self._genome_list_path = genome_list_path
        self._executor = ProcessPoolExecutor(max_workers=4)

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
                    for genome in self._get_genome_list()
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
        config, config_errors = self._config_from_data(data)

        if config_errors is not None:
            return ErrorResult(
                label="Error",
                id=str(uuid4()),
                errors=[
                    FieldError(
                        fieldId=key,
                        id=error
                    )
                    for key, error in config_errors
                ]
            )

        genome = self._get_genome_ref(config.genome)
        src_fa_path = self._abs_genome_path(genome.fa_path)
        src_indexed_fa_path = f"{src_fa_path}.fai"
        src_gtf_path = self._abs_genome_path(genome.gtf_path)

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
                        description="Initiating calculations"
                    )
                ]
            )
        )
        self._executor.submit(
            run_prope_design,
            result_context,
            src_fa_path,
            src_indexed_fa_path,
            src_gtf_path,
            config,
        )

        return result_context.get_result()

    def _abs_genome_path(self, path: str):
        genome_root = os.path.dirname(self._genome_list_path)
        return os.path.normpath(
            os.path.join(genome_root, path)
        )

    def _get_genome_list(self) -> list[GenomeDataSet]:
        genome_list = self._load_genome_list()
        return genome_list

    def _get_genome_ref(self, id: str):
        genome_list = self._load_genome_list()
        return next(
            g
            for g in genome_list
            if g.id == id
        )

    def _load_genome_list(self):
        try:
            with open(self._genome_list_path) as f:
                data_list = json.load(f)
                return [
                    GenomeDataSet(**entry)
                    for entry in data_list
                ]
        except FileNotFoundError:
            return []

    def _config_from_data(self, raw_data):
        errors = []
        parsers = {
            "genome": create_enum_parser({item.id for item in self._get_genome_list()}),
            "genes": parse_genes,
            "identifier_type": create_enum_parser({"gene_name", "gene_id"}),
            "plp_length": int,
            "min_coverage": int,
            "gc_min": int,
            "gc_max": int,
            "iupac_mismatches": parse_iupac_mismatches,
            "max_errors": int,
            "tm_min": int,
            "tm_max": int,
            "lowest_percentile_tm_score_cutoff": int,
            "minimum_prope_distance": int,
            "filter_ligation_junction": self._parse_boolean,
            "number_of_probes": int,
            "off_target_output": self._parse_boolean,
            "check_probe_specificity": self._parse_boolean,
        }

        data = {}

        for key, parser in parsers.items():
            try:
                data[key] = parsers[key](raw_data[key])
            except ValueError as e:
                errors.append((key, str(e)))


        return (
            (Config(
                genome=data["genome"],
                genes=data["genes"],
                identifier_type=data["identifier_type"],
                plp_length=data["plp_length"],
                min_coverage=data["min_coverage"],
                gc_min=data["gc_min"],
                gc_max=data["gc_max"],
                iupac_mismatches=data["iupac_mismatches"],
                max_errors=data["max_errors"],
                tm_min=data["tm_min"],
                tm_max=data["tm_max"],
                lowest_percentile_tm_score_cutoff=data["lowest_percentile_tm_score_cutoff"],
                minimum_prope_distance=data["minimum_prope_distance"],
                filter_ligation_junction=data["filter_ligation_junction"],
                number_of_probes=data["number_of_probes"],
                off_target_output=data["off_target_output"],
                check_probe_specificity=data["check_probe_specificity"],
            ), None)
            if len(errors) == 0
            else (None, errors)
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


@contextlib.contextmanager
def cwd_context(target_cwd):
    original_cwd = os.getcwd()
    os.chdir(target_cwd)

    try:
        yield

    finally:
        os.chdir(original_cwd)


def current_time():
    return datetime.now().timestamp()


def run_prope_design(
    result_context: ResultContext,
    src_fa_path: str,
    src_indexed_fa_path: str,
    src_gtf_path: str,
    config: Config,
):
    status_entries: list[StatusEntry] = []

    def _update_status(status: StatusEntry):
        nonlocal status_entries
        status_entries = [
            *status_entries,
            status,
        ]
        logger.warning(f"{status.progress}: {status.description}")
        result_context.set_item(
            StatusData(
                label="PLP Result Status",
                id="plp-result",
                status=status_entries
            )
        )

    try:
        start_time = current_time()
        with tempfile.TemporaryDirectory(prefix="plp-workdir") as workdir:
            with cwd_context(workdir):
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"config: {config}"
                    )
                )
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"workdir: {workdir}"
                    )
                )

                fa_path = os.path.join(workdir, f"{os.path.basename(src_fa_path)}")
                os.symlink(src_fa_path, fa_path)
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"fa_path: {src_fa_path}, {fa_path}"
                    )
                )

                if os.path.isfile(src_indexed_fa_path):
                    indexed_fa_path = os.path.join(workdir, f"{os.path.basename(src_indexed_fa_path)}")
                    os.symlink(src_indexed_fa_path, indexed_fa_path)
                    _update_status(
                        StatusEntry(
                            progress=0,
                            description=f"indexed_fa_path: {src_indexed_fa_path}, {indexed_fa_path}"
                        )
                    )

                gtf_path = os.path.join(workdir, f"{os.path.basename(src_gtf_path)}")
                os.symlink(src_gtf_path, gtf_path)
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"gtf_path: {src_gtf_path}, {gtf_path}"
                    )
                )

                extracted_features_output_path = os.path.join(workdir, "extracted_features.txt")
                transcriptome_output_path = os.path.join(workdir, "transcriptome.fa")
                extracted_sequences_fa_output_path = os.path.join(workdir, "extracted_sequences.fa")
                regions_output_path = os.path.join(workdir, "regions")
                result_output_path = os.path.join(workdir, "result.csv")

                _update_status(
                    StatusEntry(
                        progress=10,
                        description=f"extracted_features: {config.genes}"
                    )
                )

                extracted_features = extract_features(
                    gtf=gtf_path,
                    output=extracted_features_output_path,
                    genes=config.genes,
                    identifier_type=config.identifier_type,
                )
                _update_status(
                    StatusEntry(
                        progress=10,
                        description=f"extracted_features: {current_time() - start_time}"
                    )
                )

                extract_mrna(
                    gtf_file=gtf_path,
                    output_file=transcriptome_output_path,
                    fasta_file=fa_path,
                )
                _update_status(
                    StatusEntry(
                        progress=20,
                        description=f"extract_mrna: {current_time() - start_time}"
                    )
                )

                extract_sequences(
                    gtf_output=extracted_features_output_path,
                    fasta=fa_path,
                    output_fasta=extracted_sequences_fa_output_path,
                    plp_length=config.plp_length,
                    identifier_type=config.identifier_type,
                    regions_file=regions_output_path
                )
                _update_status(
                    StatusEntry(
                        progress=40,
                        description=f"extract_sequences: {current_time() - start_time}"
                    )
                )

                targets_df = find_targets(
                    selected_features=extracted_features_output_path,
                    sequences_output=extracted_sequences_fa_output_path,
                    output_file=result_output_path,
                    reference_fasta=extracted_sequences_fa_output_path,
                    min_coverage=config.min_coverage,
                    gc_min=config.gc_min,
                    gc_max=config.gc_max,
                    num_probes=config.number_of_probes,
                    iupac_mismatches=config.iupac_mismatches,
                    max_errors=config.max_errors,
                    check_specificity=config.check_probe_specificity,
                    plp_length=config.plp_length,
                    Tm_min=config.tm_min,
                    Tm_max=config.tm_max,
                    lowest_percentile_Tm_score_cutoff=config.lowest_percentile_tm_score_cutoff,
                    min_dist_probes=config.minimum_prope_distance,
                    filter_ligation_junction=config.filter_ligation_junction,
                    off_target_output=config.off_target_output
                )
                _update_status(
                    StatusEntry(
                        progress=100,
                        description=f"find_targets: {current_time() - start_time}"
                    )
                )

                headers = {
                    header: header
                    for header in targets_df.columns.values
                }
                entries = [entry for entry in targets_df.to_dict(orient="records")]
                result_context.set_item(
                    TableData(
                        id="plp-result",
                        label="PLP Result",
                        headers=headers,
                        entries=entries,
                    )
                )

    except Exception as e:
        _update_status(
            StatusEntry(
                progress=100,
                description=f"Search failed: {e}: {current_time() - start_time}"
            )
        )


def create_adapter():
    return PLPAdapter(
        genome_list_path=GENOME_LIST_PATH,
    )
