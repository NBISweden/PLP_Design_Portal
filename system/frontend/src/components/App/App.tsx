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
                            <div className="column is-half">
                                <form>
                                    <fieldset className="box">
                                        <legend className="label">Input</legend>
                                        <InputField type="text" label="Text "/>
                                        <CheckBox label="FASTA input: Source sequence is absent in reference genome:"/>
                                    </fieldset>
                                    <fieldset className="box">
                                        <legend className="label">Distance</legend>
                                        <DropDown options={[0, 1].map(o => ({ value: o, label: `${o}` }))} label="Choose an option:" />
                                    </fieldset>
                                        <button type="submit" className="button is-pulled-right has-background-grey has-text-white">Submit</button>
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