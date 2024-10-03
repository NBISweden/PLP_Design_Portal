import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from "./components/App/App";
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import './index.css'


i18next.use(initReactI18next).init({
  lng: "en",
  resources: {
      en: {
        translation: {
          "fields": {
            "source_sequence.gene_transcript_name_or_fasta.label": "Ensembl gene/transcript name(s) or FASTA sequence",
            "source_sequence.attribute_identifier": {
              label: "Attribute identifier",
              options: {
                gene_id: "Gene ID",
                transcript_id: "Transcript ID"
              }
            },
            "source_sequence.feature_identifier": {
              label: "Feature identifier",
              options: {
                "exon": "exon",
                "CDS": "CDS",
                "gene": "gene",
                "transcript": "transcript",
                "three_prime_utr": "three_prime_utr",
                "five_prime_utr": "five_prime_utr",
              }
            },
            "source_sequence.fasta_source_sequence_absent.label": "FASTA input: Source sequence is absent in reference genome:",
            "probe_design.probe_arm_length.label": "Probe arm length",
            "probe_design.min_genome_distance": {
              label: "Min. genome distance",
              options: {1: 1, 2: 2}
            },
            "probe_design.use_hamming_distance.label": "Use hamming distance (default is edit distance):",
            "probe_design.only_one_unique_arm.label": "Only one arm needs to be unique (default is both arms):",
            "probe_design.allow_overlapping_probes.label": "Allow overlapping probes (default is non-overlapping):",
            "color_code.amount_of_colors": {
              label: "Amount of colors",
              options: {2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8}
            },
            "color_code.length_of_code": {
              label: "Length of code",
              options: {2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8}
            },
            "anchor_and_spacer.anchor.label": "Anchor",
            "anchor_and_spacer.spacer_left.label": "Spacer left",
            "anchor_and_spacer.spacer_right.label": "Spacer right",
            "genome.genome": {
              options: {
                "Arabidopsis thaliana - TAIR10": "Arabidopsis thaliana - TAIR10",
                "Caenorhabditis elegans - WBcel235": "Caenorhabditis elegans - WBcel235",
                "Danio rerio - GRCz10": "Danio rerio - GRCz10",
                "Drosophila melanogaster - BDGP6": "Drosophila melanogaster - BDGP6",
                "Homo sapiens - GRCh37": "Homo sapiens - GRCh37",
                "Homo sapiens - GRCh38": "Homo sapiens - GRCh38",
                "Mus musculus - GRCm38": "Mus musculus - GRCm38",
                "Oryzias latipes - Medaka1": "Oryzias latipes - Medaka1",
                "Saccharomyces cerevisiae - R64": "Saccharomyces cerevisiae - R64",
                "SARS-CoV-2 - NC_045512.2": "SARS-CoV-2 - NC_045512.2"
              }
            },
          }
        }
      }
  }
})


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App path="root"/>
  </StrictMode>,
)
