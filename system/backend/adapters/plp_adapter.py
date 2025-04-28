from .result_data import Result, TableData


name = "plp_search"


fields = [
    {
        "id": "source_sequence.gene_transcript_name_or_fasta",
        "type": "text",
        "placeholder": "ENSG00000171862",
        "required": True
    },
    {
        "id": "source_sequence.attribute_identifier",
        "type": "choice",
        "options": [
            "gene_id",
            "transcript_id"
        ]
    },
    {
        "id": "source_sequence.feature_identifier",
        "type": "choice",
        "options": [
            "exon",
            "CDS",
            "gene",
            "transcript",
            "three_prime_utr",
            "five_prime_utr"
        ]
    },
    {
        "id": "source_sequence.fasta_source_sequence_absent",
        "type": "yesno"
    },
    {
        "id": "probe_design.probe_arm_length",
        "type": "number"
    },
    {
        "id": "probe_design.min_genome_distance",
        "type": "choice",
        "options": [
            1,
            2
        ]
    },
    {
        "id": "probe_design.use_hamming_distance",
        "type": "yesno"
    },
    {
        "id": "probe_design.only_one_unique_arm",
        "type": "yesno"
    },
    {
        "id": "probe_design.allow_overlapping_probes",
        "type": "yesno"
    },
    {
        "id": "color_code.amount_of_colors",
        "type": "choice",
        "options": [
            2,
            3,
            4,
            5,
            6,
            7,
            8
        ]
    },
    {
        "id": "color_code.length_of_code",
        "type": "choice",
        "options": [
            2,
            3,
            4,
            5,
            6,
            7,
            8
        ]
    },
    {
        "id": "anchor_and_spacer.anchor",
        "type": "text",
        "placeholder": "TGCGTCTATTTAGTGGAGCC"
    },
    {
        "id": "anchor_and_spacer.spacer_left",
        "type": "text",
        "placeholder": "TCCTC"
    },
    {
        "id": "anchor_and_spacer.spacer_right",
        "type": "text",
        "placeholder": "TCTTT"
    },
    {
        "id": "genome.genome",
        "type": "choice",
        "options": [
            "Arabidopsis thaliana - TAIR10",
            "Caenorhabditis elegans - WBcel235",
            "Danio rerio - GRCz10",
            "Drosophila melanogaster - BDGP6",
            "Homo sapiens - GRCh37",
            "Homo sapiens - GRCh38",
            "Mus musculus - GRCm38",
            "Oryzias latipes - Medaka1",
            "Saccharomyces cerevisiae - R64",
            "SARS-CoV-2 - NC_045512.2"
        ]
    }
]

links = [
    {
        "id": "github",
        "href": "https://github.com/NBISweden/PLP_Design_Portal",
        "icon": "fa-brands fa-github",
    }
]


translation = {
    "en": {
        "translation": {
            "results": {
                "title": "Results",
                "download_file": "Download '{{name}}'"
            },
            "form": {},
            "service": {
                "title": "ISS Probe design",
                "subtitle": "Design padlock probes for in-situ sequencing"
            },
            "fields": {
                "source_sequence.gene_transcript_name_or_fasta.label": "Ensembl gene/transcript name(s) or FASTA sequence",
                "source_sequence.attribute_identifier.label": "Attribute identifier",
                "source_sequence.feature_identifier.label": "Feature identifier",
                "source_sequence.fasta_source_sequence_absent.label": "FASTA input: Source sequence is absent in reference genome:",
                "probe_design.probe_arm_length.label": "Probe arm length",
                "probe_design.min_genome_distance.label": "Min. genome distance",
                "probe_design.use_hamming_distance.label": "Use hamming distance (default is edit distance):",
                "probe_design.only_one_unique_arm.label": "Only one arm needs to be unique (default is both arms):",
                "probe_design.allow_overlapping_probes.label": "Allow overlapping probes (default is non-overlapping):",
                "color_code.amount_of_colors.label": "Amount of colors",
                "color_code.length_of_code.label": "Length of code",
                "anchor_and_spacer.anchor.label": "Anchor",
                "anchor_and_spacer.spacer_left.label": "Spacer left",
                "anchor_and_spacer.spacer_right.label": "Spacer right",
                "genome.genome.label": "Select genome"
            },
            "links": {
                "github": "View on GitHub"
            }
        }
    }
}


info = {
    "name": name,
    "description": "PLP Search",
    "version": "0.0.1"
}


def service(data):
    return Result(
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
