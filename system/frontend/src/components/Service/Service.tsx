import { FormEventHandler, useState, useContext } from "react";
import { FieldContext, DisableFieldManager } from "../Fields";
import { useClient} from "../../modules/Client";
import { ErrorContext, useStaticErrorManager } from "../../modules/ErrorContext";
import { Form } from "../Form/Form";
import { useResults } from "../Result/ResultContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Service() {
    const {t} = useTranslation()
    const [errorManager, setErrors] = useStaticErrorManager();
    const [isWaiting, setIsWaiting] = useState<boolean>(false)
    const fieldContext = useContext(FieldContext);
    const fieldDefs = fieldContext.listFields();
    const client = useClient();
    const results = useResults();
    const navigate = useNavigate();
    const handleSubmit: FormEventHandler = (event) => {
        setIsWaiting(true);
        event.preventDefault();
        event.stopPropagation();
        const values = fieldDefs.reduce<{[x: string]: string}>((acc, fd) => {
            const target = (event.target as any)[fd.id]; // eslint-disable-line
            const dataValue = target.getAttribute("data-selected-value");
            const value = (
                dataValue === null
                ? (target.type === "checkbox" ? !!target.checked : target.value)
                : dataValue
            );
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
                results.setResult(result);
                navigate(`/results/${result.id}`);
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
    const fieldManager = isWaiting ? new DisableFieldManager(fieldContext) : fieldContext;
    return (
        <section className="section has-background-custom-grey-light">
            <div className="container">
                <h2 className="title is-size-4-mobile has-text-centered">{t("service.title")}</h2>
                <div className="columns is-centered">
                    <div className="column is-two-thirds">
                        <FieldContext.Provider value={fieldManager}>
                            <ErrorContext.Provider value={errorManager}>
                                <Form handleSubmit={handleSubmit} layout={client.layout}/>
                            </ErrorContext.Provider>
                        </FieldContext.Provider>
                        <hr />
                        {isWaiting ? t("service.waiting_for_results") : <></>}
                    </div>
                </div>
            </div>
        </section>
    )
}

