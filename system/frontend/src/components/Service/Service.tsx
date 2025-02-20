import { FormEventHandler } from "react";
import { useFields } from "../Fields";
import { useClient } from "../../modules/Client";
import { Form } from "../Form/Form";
import { useResults } from "../Result/ResultContext";
import { useNavigate } from "react-router-dom";

export function Service(_props: {}) {
    const fieldDefs = useFields()
    const client = useClient();
    const results = useResults();
    const navigate = useNavigate();
    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const values = fieldDefs.reduce<{[x: string]: string}>((acc, fd) => {
            const target = (event.target as any)[fd.id];
            const value = target.type === "checkbox" ? !!target.checked : target.value;
            acc[fd.id] = `${value}`;
            return acc;
        }, {});
        const query = client.query(values);
        const resultRef = results.addResult(query, client.id);
        navigate(`/results/${resultRef.id}`);
    }
    return (
        <section className="section has-background-custom-grey-light">
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

