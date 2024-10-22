import { FormEventHandler } from "react";
import { useFields } from "../Fields";
import { useClient } from "../../modules/Client";
import {Form} from "../Form/Form";

export function Service(_props: {}) {
    const fieldDefs = useFields()
    const client = useClient();
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
        <section className="section">
            <div className="container">
                <h2 className="title is-size-4-mobile has-text-centered">Input</h2>
                <div className="columns is-centered">
                    <div className="column is-two-thirds">
                        <Form handleSubmit={handleSubmit}/>
                    </div>
                </div>
            </div>
        </section>
    )
}