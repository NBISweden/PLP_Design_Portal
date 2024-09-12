import { InputField, CheckBox, DropDown } from "../Fields"
import "./App.css"

type MenuItem = {
    label: string;
} & (
    {
        href: string;
    } | {
        onClick: () => void;
    }
)

function Header({title, menuItems}: {title: string, menuItems: MenuItem[]}) {
    return (
        <header>
            <h1>{title}</h1>
            <nav>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                        {"href" in item
                        ? (
                            <a href={item.href}>
                                {item.label}
                            </a>
                        )
                        : (
                            <a onClick={item.onClick}>
                                {item.label}
                            </a>
                        )}
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

function Footer(_props: {}) {
    return (
        <footer>
            <p>Provided by NBIS system development</p>
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
            <Header title="ISS Probe design" menuItems={menuItems} />
            <main>
                <section>
                    <h2>Input</h2>
                    <form>
                        <fieldset>
                            <legend>Input</legend>
                            <InputField type="text" label="Text:"/>
                            <CheckBox label="FASTA input: Source sequence is absent in reference genome:"/>
                        </fieldset>
                        <fieldset>
                            <legend>Distance</legend>
                                <DropDown options={[0,1].map(o => ({value: o, label: `${o}`}))} label="Choose an option:"/>
                        </fieldset>
                        <button type="submit">Submit</button>
                    </form>
                </section>
            </main>
            <Footer />
        </>
    );
}