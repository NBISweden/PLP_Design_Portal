import { InputField, CheckBox, DropDown} from "../Fields"
import { useField, FieldDef } from "./FieldContext";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../modules/utils";
import { useFieldErrors } from "../../modules/ErrorContext";

export type WidgetProps = {
    label: string,
    type: string,
    name: string,
    placeholder: string,
    required: boolean,
    default?: unknown,
    options?: {
        value: unknown,
        label: string
    }[]
}

export function FieldView(props: {
    fieldDef: FieldDef,
    widget?: (props: WidgetProps) => JSX.Element
}) {
    const {t} = useTranslation();
    const fieldDef = props.fieldDef;
    const widget = props.widget;
    const label = t(`fields.${fieldDef.id}.label`);
    const name = fieldDef.id;
    const options = (
        fieldDef.type == "choice"
        ? fieldDef.options.map(o => ({
            value: o,
            label: t(`fields.${fieldDef.id}.options.${o}`, `${o}`)
        }))
        : []
    );
    const placeholder = (
        "placeholder" in fieldDef && fieldDef.placeholder !== undefined 
        ? `${fieldDef.placeholder}`
        : ""
    );
    const required = fieldDef.required === undefined ? false : fieldDef.required;

    if (widget !== undefined) {
        const defaultValue = fieldDef.default;
        return widget({label, type: fieldDef.type, name, default: defaultValue, options, placeholder, required})
    } else {
        switch (fieldDef.type) {
            case "choice": {
                const defaultValue = fieldDef.default;
                return <DropDown label={label} name={name} defaultValue={defaultValue} options={options} required={required}/>
            }
            case "number": {
                const defaultValue = fieldDef.default;
                return <InputField type="number" name={name} defaultValue={defaultValue} label={label} placeholder={placeholder} required={required}/>
            }
            case "text": {
                const defaultValue = fieldDef.default;
                return <InputField type="text" name={name} defaultValue={defaultValue} label={label} placeholder={fieldDef.placeholder} required={required}/>
            }
            case "yesno": {
                const defaultValue = fieldDef.default;
                return <CheckBox name={name} label={label} defaultValue={defaultValue} required={required}/>
            }
        }
    }
}


export function MissingField({id, message}: {id: string, message: string}) {
    return (
        <div className="field">
            <div className="control">
                <label className="checkbox mr-3">
                    {id}: {message}
                </label>
            </div>
        </div>
    )
}


export function Field(props: {
    id: string,
    widget?: (props: WidgetProps) => JSX.Element
}) {
    const {t} = useTranslation();
    const {id, widget} = props;
    const errors = useFieldErrors(id);
    try {
        const fieldDef = useField(id);
        return (
            <>
                <FieldView fieldDef={fieldDef} widget={widget}/>
                {errors.length > 0 ? <div>
                    <ul>
                        {errors.map((error, index) => (<li key={index}>{t(error.id, error.description || error.id)}</li>))}
                    </ul>
                </div> : <></>}
            </>
        )
    } catch(e: unknown) {
        const message = getErrorMessage(e, "Failed to get field");
        return (
            <MissingField id={id} message={message}/>
        );
    }
}
