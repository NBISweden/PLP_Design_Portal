import { FieldDef } from "../../components/Fields"


function range(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export const fields: FieldDef[] = [
    {
        id: "source_sequence.gene_transcript_name_or_fasta",
        type: "text",
        placeholder: "ENSG00000171862",
        required: true,
    },
    {
        id: "source_sequence.attribute_identifier",
        type: "choice",
        options: [
            "gene_id",
            "transcript_id"
        ]
    },
    {
        id: "source_sequence.feature_identifier",
        type: "choice",
        options: [
            "exon",
            "CDS",
            "gene",
            "transcript",
            "three_prime_utr",
            "five_prime_utr"
        ]
    },
    {
        id: "source_sequence.fasta_source_sequence_absent",
        type: "yesno",
    },

    {
        id: "probe_design.probe_arm_length",
        type: "number",
    },
    {
        id: "probe_design.min_genome_distance",
        type: "choice",
        options: [1, 2]
    },
    {
        id: "probe_design.use_hamming_distance",
        type: "yesno",
    },
    {
        id: "probe_design.only_one_unique_arm",
        type: "yesno",
    },
    {
        id: "probe_design.allow_overlapping_probes",
        type: "yesno",
    },

    {
        id: "color_code.amount_of_colors",
        type: "choice",
        options: range(2, 8)
    },
    {
        id: "color_code.length_of_code",
        type: "choice",
        options: range(2, 8)
    },

    {
        id: "anchor_and_spacer.anchor",
        type: "text",
        placeholder: "TGCGTCTATTTAGTGGAGCC"
    },
    {
        id: "anchor_and_spacer.spacer_left",
        type: "text",
        placeholder: "TCCTC"
    },
    {
        id: "anchor_and_spacer.spacer_right",
        type: "text",
        placeholder: "TCTTT",
    },

    {
        id: "genome.genome",
        type: "choice",
        options: [
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
];
