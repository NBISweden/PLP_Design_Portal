import { InputField, FieldDef, Field, FieldGetter, FieldContext } from "../Fields"
import "./App.css"
import {Header, MenuItem} from "../Header/Header";

function Footer(_props: {}) {
    return (
        <footer className="footer">
            <p className="content has-text-centered">Provided by NBIS system development</p>
        </footer>
    )
}

function range(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const getField: FieldGetter = (id: string, type?: FieldDef["type"]) => {
    const fieldDefs: FieldDef[] = [
        {
            id: "source_sequence.gene_transcript_name_or_fasta",
            type: "text",
            placeholder: "ENSG00000171862"
        },
        {
            id: "source_sequence.attribute_identifier",
            type: "choice",
            options: [
                "gene_id",
                "transcript_id"
            ],
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

    const fieldDef: FieldDef | undefined = fieldDefs.filter(
        fd => fd.id === id && (!type || fd.type === type)
    )[0];
    if (fieldDef === undefined) {
        throw new Error(`No field with specified requirement found: id: ${id} type: ${type}`)
    } else {
        return fieldDef;
    }
}



export function App(_props: {path: string}) {
    const menuItems: MenuItem[] = [
        {
            label: "View on GitHub",
            href: "https://github.com/NBISweden/PLP_Design_Portal"
        },
    ]
    return (
        <>
            <Header title="ISS Probe design" subtitle="Design padlock probes for in-situ sequencing" menuItems={menuItems} />
            <main>
                <section className="section">
                    <div className="container">
                        <h2 className="title is-size-4-mobile has-text-centered">Input</h2>
                        <div className="columns is-centered">
                            <div className="column is-two-thirds">
                                <FieldContext.Provider value={{getField: getField}}>
                                    <form>
                                        <fieldset className="box">
                                            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Source sequences for target design</legend>
                                            <Field id="source_sequence.gene_transcript_name_or_fasta" widget={((props) => (<InputField {...props} type="textarea" rows={5}/>))}/>
                                            <div className="columns is-vcentered">
                                                <div className="column">
                                                    <Field id="source_sequence.attribute_identifier" />
                                                </div>
                                                <div className="column">
                                                    <Field id="source_sequence.feature_identifier" />
                                                </div>
                                            </div>
                                            <Field id="source_sequence.fasta_source_sequence_absent" />
                                        </fieldset>
                                        <fieldset className="box">
                                            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Probe design</legend>
                                            <div className="columns is-vcentered">
                                                <div className="column">
                                                    <Field id="probe_design.probe_arm_length" />
                                                </div>
                                                <div className="column">
                                                    <Field id="probe_design.min_genome_distance" />
                                                </div>
                                            </div>
                                            <Field id="probe_design.use_hamming_distance" />
                                            <Field id="probe_design.only_one_unique_arm" />
                                            <Field id="probe_design.allow_overlapping_probes" />
                                        </fieldset>
                                        <fieldset className="box">
                                            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Color code</legend>
                                            <div className="columns is-vcentered">
                                                <div className="column">
                                                    <Field id="color_code.amount_of_colors" />
                                                </div>
                                                <div className="column">
                                                    <Field id="color_code.length_of_code" />
                                                </div>
                                            </div>
                                        </fieldset>
                                        <fieldset className="box">
                                            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Anchor and spacer sequences</legend>
                                            <div className="columns is-vcentered">
                                                <div className="column">
                                                    <Field id="anchor_and_spacer.anchor" widget={((props) => (<InputField {...props} type="textarea" rows={1}/>))}/>
                                                </div>
                                                <div className="column">
                                                    <Field id="anchor_and_spacer.spacer_left" widget={((props) => (<InputField {...props} type="textarea" rows={1}/>))}/>
                                                </div>
                                                <div className="column">
                                                    <Field id="anchor_and_spacer.spacer_right" widget={((props) => (<InputField {...props} type="textarea" rows={1}/>))}/>
                                                </div>
                                            </div>
                                        </fieldset>
                                        <fieldset className="box">
                                            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">Genome</legend>
                                            <Field id="genome.genome" />
                                        </fieldset>
                                        <button type="submit" className="button is-pulled-right has-background-grey has-text-white">Launch analysis</button>
                                        <button type="submit" className="button is-pulled-right has-background-grey has-text-white">Show example</button>
                                    </form>
                                </FieldContext.Provider>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>

    );
}