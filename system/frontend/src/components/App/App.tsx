import { FormEventHandler } from "react";
import { Header, MenuItem } from "../Header/Header";
import { InputField, Field, useFields } from "../Fields";
import { useClient } from "../../modules/Client";
import "./App.css";


function Footer(_props: {}) {
    return (
        <footer className="footer">
            <p className="content has-text-centered">Provided by NBIS system development</p>
        </footer>
    )
}

export function App(_props: {path: string}) {
    const fieldDefs = useFields()
    const client = useClient();
    const menuItems: MenuItem[] = [
        {
            label: "View on GitHub",
            href: "https://github.com/NBISweden/PLP_Design_Portal"
        },
    ]

    const handleSubmit: FormEventHandler = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const values = fieldDefs.reduce<{[x: string]: string}>((acc, fd) => {
            const target = (event.target as any)[fd.id];
            const value = target.type === "checkbox" ? !!target.checked : target.value;
            acc[fd.id] = `${value}`;
            return acc;
        }, {});
        console.log("values", values)
        const result = await client.getResults(values);
        console.log(result);
    }
    
    return (
        <>
            <Header title="ISS Probe design" subtitle="Design padlock probes for in-situ sequencing" menuItems={menuItems} />
            <main>
                <section className="section">
                    <div className="container">
                        <h2 className="title is-size-4-mobile has-text-centered">Input</h2>
                        <div className="columns is-centered">
                            <div className="column is-two-thirds">
                                <form onSubmit={handleSubmit}>
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
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>

    );
}