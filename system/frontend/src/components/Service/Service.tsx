import { FormEventHandler, useState } from "react";
import { useFields } from "../Fields";
import { useClient} from "../../modules/Client";
import { ErrorContext, useStaticErrorManager } from "../../modules/ErrorContext";
import { Form } from "../Form/Form";
import { useResults } from "../Result/ResultContext";
import { useNavigate } from "react-router-dom";

export function Service() {
    const [errorManager, setErrors] = useStaticErrorManager();
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
                setErrors(
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
                setIsWaiting(false);
            } else {
                const resultRef = results.addResult(result);
                navigate(`/results/${resultRef.id}`);
            }
        }).catch((e) => {
            setErrors([
                {
                    id: "query-failed",
                    description: e.toString(),
                    groupId: null,
                }
            ]);
            setIsWaiting(false);
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

