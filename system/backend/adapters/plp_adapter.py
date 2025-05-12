from dataclasses import dataclass
from typing import Literal
from .result_data import Result, ErrorResult, Error, FieldError, TableData
from plp_directrna_design import probedesign as plp
import os
import json


GENOME_LIST_PATH = os.getenv("PLP_GENOME_LIST_PATH", "genome_list.json")


@dataclass
class Config:
    genome_dataset_id: str
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


@dataclass
class GenomeDataSet:
    id: str
    version: str
    fa_path: str
    gtf_path: str


class PLPAdapter:
    name = "plp_search"

    def __init__(self, genome_list_path: str):
        self._genome_list_path = genome_list_path

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
                "id": "probe_design.genome",
                "type": "choice",
                "options": [
                    genome.id
                    for genome in self._get_genome_list()
                ]
            },
            {
                "id": "probe_design.genes",
                "type": "text",
                "default": "Grik2"
            },
            {
                "id": "probe_design.identifier_type",
                "type": "choice",
                "options": [
                    "gene_name",
                    "gene_id"
                ],
                "default": "gene_name"
            },
            {
                "id": "probe_design.gene_feature",
                "type": "choice",
                "options": [
                    "CDS",
                    "exon"
                ],
                "default": "CDS"
            },
            {
                "id": "probe_design.plp_length",
                "type": "number",
                "default": 30
            },
            {
                "id": "probe_design.iupac_mismatches",
                "type": "text",
            },
            {
                "id": "probe_design.max_errors",
                "type": "choice",
                "options": [1, 2, 3, 4, 5, 6]
            },
            {
                "id": "probe_design.tm_min",
                "type": "number",
                "default": 58
            },
            {
                "id": "probe_design.tm_max",
                "type": "number",
                "default": 62,
            },
            {
                "id": "probe_design.lowest_percentile_tm_score_cutoff",
                "type": "number",
                "default": 5
            },
            {
                "id": "probe_design.minimum_prope_distance",
                "type": "number",
                "default": 8
            },
            {
                "id": "probe_design.filter_ligation_junction",
                "type": "choice",
                "options": ["true", "false"],
                "default": "true"
            },
            {
                "id": "probe_design.number_of_probes",
                "type": "number",
                "default": 10,
            },
            {
                "id": "probe_design.off_target_output",
                "type": "choice",
                "options": ["true", "false"],
                "default": "false"
            },
            {
                "id": "probe_design.check_probe_specificity",
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
                        "download_file": "Download '{{name}}'"
                    },
                    "form": {
                        "groups": {
                            "all_fields": "All fields",
                        },
                        "submit": "Launch analysis",
                        "show_example": "Show example"
                    },
                    "service": {
                        "title": "ISS Probe design",
                        "subtitle": "Design padlock probes for in-situ sequencing"
                    },
                    "fields": {
                        "probe_design.genome.label": "Genome",
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
                "id": "all_fields",
                "fields": [
                    {
                        "type": "field",
                        "id": field["id"]
                    }
                    for field in self.fields
                ]
            }
        ]

    def run(self, data) -> list[Result] | ErrorResult:
        return [
            Result(
                id="plp-search",
                label="PLP Search",
                content=TableData(
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
        ]

    def run_prope_design(self, config: Config) -> list[Result]:
        pass

    def _get_genome_list(self) -> list[GenomeDataSet]:
        genome_list = self._load_genome_list()
        return genome_list

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


adapter = PLPAdapter(
    genome_list_path=GENOME_LIST_PATH
)
