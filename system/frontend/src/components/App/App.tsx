import React from "react";
import { InputField, CheckBox, DropDown } from "../Fields";
import { Field, FieldGroup, FieldValueSpec } from "../../modules/ClientAPI";
import { ClientContext } from "../../modules/ClientContext";
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

function FieldView({field}: {field: Field}) {
    switch(field.view) {
        case "input": return (
            <InputField type="text" label={field.label} />
        );
        case "checkbox": return (
            <CheckBox label={field.label} />
        );
        case "dropdown": return (
            <DropDown label={field.label} options={field.options || []}/>
        );
    }
}

function FieldGroupView({group, children}: React.PropsWithChildren<{group: FieldGroup}>) {
    return (
        <fieldset>
            <legend>{group.label}</legend>
            {group.description ? <p>{group.description}</p> : <></>}
            {React.Children.toArray(children).map((c, ci) => (
                <div key={ci}>{c}</div>
            ))}
        </fieldset>
    )
}

function FormView({fieldGroups, initialValues, onSubmit}: {fieldGroups: FieldGroup[], initialValues: Record<string, FieldValueSpec>, onSubmit?: () => void}) {
    return (
        <form>
            {fieldGroups.map((group, gi) => (
                <FieldGroupView key={gi} group={group}>
                    {group.fields.map((field, fi) => (
                        <FieldView key={fi} field={{...field, ...initialValues[field.id]}}/>
                    ))}
                </FieldGroupView>
            ))}
            <button type="submit">Submit</button>
        </form>
    );
}

export function App(_props: {path: string}) {
    const menuItems: MenuItem[] = [
        {
            label: "View on GitHub",
            href: "https://github.com/NBISweden/PLP_Design_Portal"
        }
    ]
    const client = React.useContext(ClientContext);
    return (
        <>
            <Header title="ISS Probe design" menuItems={menuItems} />
            <main>
                <section>
                    <h2>Input</h2>
                    <FormView
                        fieldGroups={client.getGroups()}
                        initialValues={client.getInitialValues()}
                    />
                </section>
            </main>
            <Footer />
        </>
    );
}