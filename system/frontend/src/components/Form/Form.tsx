import {Field, WidgetProps} from "../Field/Field";
import {StatefulInputField} from "../InputField/InputField";
import {FormEventHandler, Fragment} from "react";
import "./Form.css";
import { useTranslation } from "react-i18next";

interface FormProps {
    handleSubmit: FormEventHandler;
    layout: FormLayout
}


type FieldRef = {
    type: "field";
    id: string;
    widget?: {
        type: "textarea";
        rows?: number;
    }
};

type ContentRef = {
    type: "content";
    id: string;
}

type LayoutGroup = {
    id: string;
    fields: (FieldRef | ContentRef | FieldRef[])[];
}

export type FormLayout = LayoutGroup[]


function FormField(field: FieldRef) {
    const widget = field.widget;
    const extras = widget ? {
        widget: (props: WidgetProps) => (<StatefulInputField {...props} {...widget}/>)
    } : {};
    return <Field id={field.id} {...extras}/>
}

function FormGroup(group: LayoutGroup) {
    const {t} = useTranslation();
    const label = t(`form.groups.${group.id}`);
    return (
        <fieldset className="box">
            <legend className="label is-size-5 has-text-weight-medium has-text-grey-dark">{label}</legend>
            {group.fields.map((item, index) => {
                if (Array.isArray(item)) {
                    return (
                        <div className="columns is-vcentered" key={`form.section.${index}`}>
                            {item.map(subitem => (
                                <div className="column" key={`form.field.${subitem.id}`}>
                                    <FormField {...subitem}/>
                                </div>
                            ))}
                        </div>
                    );
                } else if (item.type == "field") {
                    return <FormField key={`form.field.${item.id}`} {...item}/>
                } else if (item.type == "content") {
                    const contentKey = `form.content.${item.id}`
                    return (
                        <Fragment key={`form.field.${item.id}`}>
                            <div key={contentKey}>{t(contentKey)}</div>
                            <hr/>
                        </Fragment>
                    )
                }
            })}
        </fieldset>
    )
}

export function Form({ handleSubmit, layout }: FormProps) {
    const {t} = useTranslation();
    return (
        <form onSubmit={handleSubmit}>
            {layout.map(group => {
                return (
                    <FormGroup key={group.id} {...group}/>
                );
            })}
            <button type="submit" className="button is-pulled-right is-primary">{t("form.submit")}</button>
        </form>
    )
}
