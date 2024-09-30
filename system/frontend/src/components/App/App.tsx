import { InputField, CheckBox, DropDown } from "../Fields"
import "./App.css"
import {Header, MenuItem} from "../Header/Header";

function Footer(_props: {}) {
    return (
        <footer className="footer">
            <p className="content has-text-centered">Provided by NBIS system development</p>
        </footer>
    )
}

export function App(_props: {path: string}) {
    const menuItems: MenuItem[] = [
        {
            label: "View on GitHub",
            href: "https://github.com/NBISweden/PLP_Design_Portal"
        }
    ]
    return (
        <>
            <Header title="ISS Probe design" subtitle="Design padlock probes for in-situ sequencing" menuItems={menuItems} />
            <main>
                <section className="section">
                    <div className="container">
                        <h2 className="title has-text-centered">Input</h2>
                        <div className="columns is-centered">
                            <div className="column is-two-thirds">
                                <form>
                                    <fieldset className="box">
                                        <legend className="label is-size-4 has-text-grey-dark">Source sequences for target design</legend>
                                        <InputField type="text" label="Ensembl gene/transcript name(s) or FASTA sequence " isTextArea="true" placeholder="ENSG00000171862" rows="5"/>
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <DropDown options={["gene_id", "transcript_id"].map(o => ({ value: o, label: `${o}` }))} label="Attribute identifier" />
                                            </div>
                                            <div className="column">
                                                <DropDown options={["exon", "CDS", "gene", "transcript", "three_prime_utr", "five_prime_utr"].map(o => ({ value: o, label: `${o}` }))} label="Feature identifier" />
                                            </div>
                                        </div>
                                        <CheckBox label="FASTA input: Source sequence is absent in reference genome:"/>
                                    </fieldset>
                                    <fieldset className="box">
                                        <legend className="label is-size-4 has-text-grey-dark">Probe design</legend>
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <InputField type="number" label="Probe arm length" />
                                            </div>
                                            <div className="column">
                                                <DropDown options={[0, 1].map(o => ({ value: o, label: `${o}` }))} label="Min. genome distance" />
                                            </div>
                                        </div>
                                        <CheckBox label="Use hamming distance (default is edit distance):"/>
                                        <CheckBox label="Only one arm needs to be unique (default is both arms):"/>
                                        <CheckBox label="Allow overlapping probes (default is non-overlapping):"/>
                                    </fieldset>
                                    <fieldset className="box">
                                        <legend className="label is-size-4 has-text-grey-dark">Color code</legend>
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <DropDown range={{ start: 2, end: 8 }} label="Amount of colors" />
                                            </div>
                                            <div className="column">
                                                <DropDown range={{ start: 2, end: 8 }} label="Length of code" />
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset className="box">
                                        <legend className="label is-size-4 has-text-grey-dark">Anchor and spacer sequences</legend>
                                        <div className="columns is-vcentered">
                                            <div className="column">
                                                <InputField type="text" label="Anchor " isTextArea="true" placeholder="TGCGTCTATTTAGTGGAGCC" rows="1"/>
                                            </div>
                                            <div className="column">
                                                <InputField type="text" label="Spacer left " isTextArea="true" placeholder="TCCTC" rows="1"/>
                                            </div>
                                            <div className="column">
                                                <InputField type="text" label="Spacer right " isTextArea="true" placeholder="TCTTT" rows="1"/>
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset className="box">
                                        <DropDown label="Select genome"
                                                  options={[
                                                      "Arabidopsis thaliana - TAIR10",
                                                      "Caenorhabditis elegans - WBcel235",
                                                      "Danio rerio - GRCz10",
                                                      "Drosophila melanogaster - BDGP6",
                                                      "Homo sapiens - GRCh37",
                                                      "Homo sapiens - GRCh38",
                                                      "Mus musculus - GRCm38",
                                                      "Oryzias latipes - Medaka1",
                                                      "Saccharomyces cerevisiae - R64",
                                                      "SARS-CoV-2 - NC_045512.2"].map(o => ({ value: o, label: `${o}` }))}/>
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