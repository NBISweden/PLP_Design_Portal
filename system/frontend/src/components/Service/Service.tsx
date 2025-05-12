import { FormEventHandler, useState } from "react";
import { useFields } from "../Fields";
import { useClient, Result, ErrorContent } from "../../modules/Client";
import { ErrorContext, ErrorManager, StaticErrorManager } from "../../modules/ErrorContext";
import { Form } from "../Form/Form";
import { useResults } from "../Result/ResultContext";
import { useNavigate } from "react-router-dom";

export function Service() {
    const [errorManager, setErrorManager] = useState<ErrorManager>(new StaticErrorManager([]));
    const [isWaiting, setIsWaiting] = useState<boolean>(false)
    const fieldDefs = useFields();
    const client = useClient();
    const results = useResults();
    const navigate = useNavigate();
    const handleSubmit: FormEventHandler = (event) => {
        setIsWaiting(true);
        event.preventDefault();
        event.stopPropagation();
        const values = fieldDefs.reduce<{[x: string]: string}>((acc, fd) => {
            const target = (event.target as any)[fd.id]; // eslint-disable-line
            const value = target.type === "checkbox" ? !!target.checked : target.value;
            acc[fd.id] = `${value}`;
            return acc;
        }, {});
        const query = client.query(values);

        query.get().then((result) => {
            if ("errors" in result) {
                setErrorManager(
                    new StaticErrorManager(
                        result.errors.map(e => (
                            "fieldId" in e ? {
                                ...e,
                                groupId: `field.${e.fieldId}`,
                            } : {
                                ...e,
                                groupId: null,
                            }
                        ))
                    )
                )
                setIsWaiting(false);
            } else {
                const resultRef = results.addResult(result, client.id);
                navigate(`/results/${resultRef.id}`);
            }
        }).catch((e) => {
            const errorResult: Result<ErrorContent> = [
                {
                    id: "error",
                    label: "Error",
                    description: e.toString(),
                    content: {type: "error"},
                }
            ]
            const resultRef = results.addResult(errorResult, client.id);
            navigate(`/results/${resultRef.id}`);
        });

    }
    return (
        <section className="section has-background-custom-grey-light">
            <div className="container">
                <h2 className="title is-size-4-mobile has-text-centered">Input</h2>
                <div className="columns is-centered">
                    <div className="column is-two-thirds">
                        <ErrorContext.Provider value={errorManager}>
                            {!isWaiting ? <Form handleSubmit={handleSubmit} layout={client.layout}/> : "Waiting for result"}
                        </ErrorContext.Provider>
                    </div>
                </div>
            </div>
        </section>
    )
}

