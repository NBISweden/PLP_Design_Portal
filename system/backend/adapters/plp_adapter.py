from dataclasses import dataclass
from typing import Literal
from .result_data import (
    Result,
    ErrorResult,
    TableData,
    DeferredResult,
    StatusData,
    StatusEntry,
)
from .result_manager import ResultManager, ResultContext
from plp_directrna_design import probedesign as plp  # type: ignore
from multiprocessing import Lock
from concurrent.futures import ProcessPoolExecutor
import os
import json
import tempfile
import logging
import contextlib
from datetime import datetime
import functools


GENOME_LIST_PATH = os.getenv("PLP_GENOME_LIST_PATH", "genome_list.json")
DEFERRED_RESULT_PATH = os.getenv("PLP_DEFERRED_RESULT_PATH", "/tmp")
logger = logging.getLogger(__name__)


@dataclass
class Config:
    genome: str
    genes: str = "Grik2"
    identifier_type: Literal["gene_name", "gene_id"] = "gene_name"
    gene_feature: Literal["CDS", "exon"] = "CDS"
    plp_length: int = 30
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

    @staticmethod
    def from_data(data):
        return Config(
            genome=data["genome"],
            genes=data["genes"],
            identifier_type=data["identifier_type"],
            gene_feature=data["gene_feature"],
            plp_length=int(data["plp_length"]),
            iupac_mismatches=data["iupac_mismatches"],
            max_errors=int(data["max_errors"]),
            tm_min=int(data["tm_min"]),
            tm_max=int(data["tm_max"]),
            lowest_percentile_tm_score_cutoff=int(data["lowest_percentile_tm_score_cutoff"]),
            minimum_prope_distance=int(data["minimum_prope_distance"]),
            filter_ligation_junction=data["filter_ligation_junction"].lower() == "true",
            number_of_probes=int(data["number_of_probes"]),
            off_target_output=data["off_target_output"].lower() == "true",
            check_probe_specificity=data["check_probe_specificity"].lower() == "true",
        )


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
                "id": "gene_feature",
                "type": "choice",
                "options": [
                    "CDS",
                    "exon"
                ],
                "default": "CDS"
            },
            {
                "id": "plp_length",
                "type": "number",
                "default": 30
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
                        "gene_feature.label": "Gene Feature",
                        "plp_length.label": "PLP Length",
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
                    for field_id in ["genes", "gene_feature"]
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
        config = Config.from_data(data)

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


@contextlib.contextmanager
def cwd_context(target_cwd):
    original_cwd = os.getcwd()
    os.chdir(target_cwd)

    try:
        yield

    finally:
        os.chdir(original_cwd)


def extract_features(
    gtf_file: str,
    genes_str=None,
    identifier_type='gene_id',
    gene_feature='CDS'
):
    # Parse the GTF file and filter by gene list
    gtf_df, genes_of_interest = plp.parse_gtf(gtf_file, genes_str, identifier_type)

    # Merge regions and calculate coverage
    return plp.merge_regions_and_coverage(genes_of_interest, gtf_df)


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

                extracted_features = extract_features(
                    gtf_file=gtf_path,
                    genes_str=config.genes,
                    identifier_type=config.identifier_type,
                    gene_feature=config.gene_feature
                )
                extracted_features.to_csv(extracted_features_output_path, sep='\t', index=False)
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
                    extracted_features=extracted_features,
                    fasta_file=fa_path,
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
                    fasta_file=extracted_sequences_fa_output_path,
                    output_file=result_output_path,
                    reference_fasta=extracted_sequences_fa_output_path,
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


def extract_mrna(
    gtf_file: str,
    fasta_file: str,
    output_file: str,
):
    records = plp.extract_mrna_sequences(
        fasta_file=fasta_file,
        gtf_file=gtf_file,
        output_file=output_file,
        plus_strand_only=False,
        revcomp=False,
        translate=False,
        codon_table=1,
        alternative_start_codon=True,
        clean_final_stop=True,
        clean_internal_stop=False,
        verbose=False
    )
    return records


def extract_sequences(
    extracted_features,
    fasta_file: str,
    output_fasta: str,
    plp_length: int,
    identifier_type: Literal["gene_name", "gene_id"],
    regions_file: str
):
    # Ensure FASTA index exists
    plp.check_fasta_index(fasta_file)

    # Save regions for fast retrieval
    plp.save_regions_for_faidx(extracted_features, regions_file, plp_length, identifier_type=identifier_type)

    # Extract sequences
    plp.extract_sequences(fasta_file, regions_file + ".txt", output_fasta, extracted_features)


def find_targets(
    selected_features,
    fasta_file,
    output_file,
    reference_fasta,
    min_coverage=1,
    gc_min=50,
    gc_max=65,
    num_probes=10,
    iupac_mismatches=None,
    max_errors=1,
    check_specificity=False,
    plp_length=30,
    Tm_min=55,
    Tm_max=65,
    lowest_percentile_Tm_score_cutoff=5,
    min_dist_probes=10,
    filter_ligation_junction=True,
    off_target_output=False
):
    targets_df, off_target_info = plp.find_targets(
        selected_features=selected_features,
        fasta_file=fasta_file,
        reference_fasta=reference_fasta,
        plp_length=plp_length,
        min_coverage=min_coverage,
        output_file=output_file,
        gc_min=gc_min,
        gc_max=gc_max,
        num_probes=num_probes,
        iupac_mismatches=iupac_mismatches,
        max_errors=max_errors,
        check_specificity=check_specificity,
        off_target_output=off_target_output
    )
    if off_target_output:
        # Save the off-target information
        off_target_info.to_csv(output_file.replace('.tsv', '_off_target.tsv'), sep='\t', index=False)

    # Calculate the melting temperature scores
    sequences = targets_df['Sequence']
    scores = [plp.score_padlock_probe(seq, Tm_min=Tm_min, Tm_max=Tm_max) for seq in sequences]
    targets_df['Melt_Tm_scores'] = scores
    # Calculate the suggested cutoff based on the 5th percentile
    suggested_cutoff = plp.analyze_scores(scores, percentile=lowest_percentile_Tm_score_cutoff)
    # Filter the targets based on the suggested cutoff
    targets_df = targets_df[targets_df['Melt_Tm_scores'] <= suggested_cutoff]
    # Filteer the probes based on the minimum distance between probes
    targets_df = plp.filter_probes_by_distance(targets_df, min_dist_probes=min_dist_probes)
    # filter the probes based on the ligation junction preferences
    if filter_ligation_junction:
        targets_df = targets_df[targets_df['Ligation junction'] != 'non-preferred']

    targets_df = plp.select_top_probes(targets_df, num_probes)
    # Save the output
    targets_df.to_csv(output_file, sep='\t', index=False)
    return targets_df


def create_adapter():
    return PLPAdapter(
        genome_list_path=GENOME_LIST_PATH,
    )
