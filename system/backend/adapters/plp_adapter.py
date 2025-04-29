from typing import Literal
from .result_data import Result, TableData
from plp_directrna_design import probedesign as plp


IdentifierType = Literal["gene_id", "gene_name"]


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
            "form": {
                "groups": {
                    "source_sequence": "Source sequences for target design",
                    "probe_design": "Probe design",
                    "color_code": "Color code",
                    "anchor_and_spacer": "Anchor and spacer sequences",
                    "genome": "Genome"
                },
                "submit": "Launch analysis",
                "show_example": "Show example"
            },
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


layout = [
    {
        "id": "source_sequence",
        "fields": [
            {
                "type": "field",
                "id": "source_sequence.gene_transcript_name_or_fasta",
                "widget": {"type": "textarea", "rows": 5}
            },
            [
                {
                    "type": "field",
                    "id": "source_sequence.attribute_identifier"
                },
                {
                    "type": "field",
                    "id": "source_sequence.feature_identifier"
                }
            ],
            {
                "type": "field",
                "id": "source_sequence.fasta_source_sequence_absent"
            }
        ]
    },
    {
        "id": "probe_design",
        "fields": [
            [
                {
                    "type": "field",
                    "id": "probe_design.probe_arm_length"
                },
                {
                    "type": "field",
                    "id": "probe_design.min_genome_distance"
                }
            ],
            {
                "type": "field",
                "id": "probe_design.use_hamming_distance"
            },
            {
                "type": "field",
                "id": "probe_design.only_one_unique_arm"
            },
            {
                "type": "field",
                "id": "probe_design.allow_overlapping_probes"
            }
        ]
    },
    {
        "id": "color_code",
        "fields": [
            [
                {
                    "type": "field",
                    "id": "color_code.amount_of_colors"
                },
                {
                    "type": "field",
                    "id": "color_code.length_of_code"
                }
            ]
        ]
    },
    {
        "id": "anchor_and_spacer",
        "fields": [
            [
                {
                    "type": "field",
                    "id": "anchor_and_spacer.anchor",
                    "widget": {"type": "textarea", "rows": 1}
                },
                {
                    "type": "field",
                    "id": "anchor_and_spacer.spacer_left",
                    "widget": {"type": "textarea", "rows": 1}
                },
                {
                    "type": "field",
                    "id": "anchor_and_spacer.spacer_right",
                    "widget": {"type": "textarea", "rows": 1}
                }
            ]
        ]
    },
    {
        "id": "genome",
        "fields": [
            {
                "type": "field",
                "id": "genome.genome"
            }
        ]
    }
]


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


def extract_features(
    gtf_file: str,
    genes_str: str,
    identifier_type: IdentifierType,
    gene_feature: str = "CDS"
):
    # Parse the GTF file and filter by gene list
    gtf_df, genes_of_interest = plp.parse_gtf(gtf_file, genes_str, identifier_type, gene_feature)

    # Merge regions and calculate coverage
    merged_cov_df = plp.merge_regions_and_coverage(genes_of_interest, gtf_df)

    return merged_cov_df


def extract_mrna(
    fasta_file: str,
    gtf_file: str,
):
    return plp.extract_mrna_sequences(
        fasta_file=fasta_file,
        gtf_file=gtf_file,
        plus_strand_only=False,
        revcomp=False,
        translate=False,
        codon_table=1,
        alternative_start_codon=True,
        clean_final_stop=True,
        clean_internal_stop=False,
        verbose=False
    )


def extract_sequences(
    gtf_output: str,
    fasta_file: str,
    output_fasta: str,
    plp_length: int,
    identifier_type: IdentifierType
):
    df = pd.read_csv(gtf_output, sep='\t')

    # Ensure FASTA index exists
    plp.check_fasta_index(fasta_file)

    # Save regions for fast retrieval
    regions_file = "regions"
    plp.save_regions_for_faidx(df, regions_file, plp_length, identifier_type=identifier_type)

    # Extract sequences
    plp.extract_sequences(fasta_file, regions_file + ".txt", output_fasta, df)


def find_target(
    selected_features,
    fasta_file,
    output_file,
    reference_fasta,
    min_coverage, 
    gc_min=50,
    gc_max=65,
    num_probes=10,
    iupac_mismatches=None,
    max_errors = 1, 
    check_specificity = False,
    plp_length=30,
    Tm_min=55,
    Tm_max=65, 
    lowest_percentile_Tm_score_cutoff=5,
    min_dist_probes=10,
    filter_ligation_junction=True
):

    print(f"🔹 Loading selected features from {selected_features}...")

    targets_df = plp.find_targets(selected_features = selected_features, fasta_file = fasta_file, reference_fasta = reference_fasta,
                                 plp_length = plp_length, min_coverage = min_coverage, output_file=output_file, 
                                 gc_min=gc_min, gc_max=gc_max, num_probes=num_probes, iupac_mismatches=iupac_mismatches,
                                 max_errors=max_errors, check_specificity=check_specificity)
    # Calculate the melting temperature scores
    sequences = targets_df['Sequence']
    scores = [plp.score_padlock_probe(seq, Tm_min = Tm_min, Tm_max= Tm_max) for seq in sequences]
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
