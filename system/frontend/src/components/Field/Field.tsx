import { InputField, DropDown, CheckBox, StatefulInputField, StatefulCheckBox, StatefulDropDown} from "../Fields"
import { useField, FieldDef } from "./FieldContext";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../modules/utils";
import { useFieldErrors } from "../../modules/ErrorContext";
import { useFormFieldValue, useFormContext } from "../../modules/FormContext";

export type WidgetProps = {
    label: string,
    type: string,
    name: string,
    placeholder: string,
    required: boolean,
    default?: unknown,
    disabled?: boolean,
    options?: {
        value: unknown,
        label: string
    }[]
}

function checkCondition(condition: string, state: Record<string, string | number>): boolean {
    return Object.entries(state).map(([key, value]) => `${key}=${value}`).includes(condition);
}

export function FieldView(props: {
    fieldDef: FieldDef,
    widget?: (props: WidgetProps) => JSX.Element,
    disabled?: boolean,
    onChange?: (value: string | number) => void,
    value?: string | number,
}) {
    const {t} = useTranslation();
    const fieldDef = props.fieldDef;
    const widget = props.widget;
    const label = t(`fields.${fieldDef.id}.label`);
    const name = fieldDef.id;
    const options = (
        fieldDef.type === "choice" || fieldDef.type === "yesno"
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

    const disabled = props.disabled || fieldDef.disabled;
    if (widget !== undefined) {
        const defaultValue = fieldDef.default;
        return widget({label, type: fieldDef.type, name, disabled: fieldDef.disabled, default: defaultValue, options, placeholder, required})
    } else if (props.onChange) {
        const {onChange, value} = props;
        switch (fieldDef.type) {
            case "choice": {
                return <DropDown onChange={onChange} value={value === undefined ? options[0]?.value : value} label={label} name={name} options={options} required={required} disabled={disabled}/>
            }
            case "number": {
                return <InputField onChange={onChange} value={value === undefined ? "" : value} type="number" name={name} label={label} placeholder={placeholder} required={required} disabled={disabled}/>
            }
            case "text": {
                return <InputField onChange={onChange} value={value === undefined ? 0 : value} type="text" name={name} label={label} placeholder={fieldDef.placeholder} required={required} disabled={disabled}/>
            }
            case "yesno": {
                return <CheckBox onChange={onChange} value={value === undefined ? options[0]?.value : value} name={name} label={label} options={[options[0], options[1]]} required={required} disabled={disabled}/>
            }
        }
    } else {
        switch (fieldDef.type) {
            case "choice": {
                const defaultValue = fieldDef.default;
                return <StatefulDropDown label={label} name={name} defaultValue={defaultValue} options={options} required={required} disabled={disabled}/>
            }
            case "number": {
                const defaultValue = fieldDef.default;
                return <StatefulInputField type="number" name={name} defaultValue={defaultValue} label={label} placeholder={placeholder} required={required} disabled={disabled}/>
            }
            case "text": {
                const defaultValue = fieldDef.default;
                return <StatefulInputField type="text" name={name} defaultValue={defaultValue} label={label} placeholder={fieldDef.placeholder} required={required} disabled={disabled}/>
            }
            case "yesno": {
                const defaultValue = fieldDef.default;
                return <StatefulCheckBox name={name} label={label} options={[options[0], options[1]]} defaultValue={defaultValue} required={required} disabled={disabled}/>
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
    const formManager = useFormContext();
    const [value, setValue] = useFormFieldValue(id);
    const fieldDef = useField(id);
    try {
        const disabled = (
            formManager &&
            fieldDef.conditions &&
            fieldDef.conditions.length > 0 
            ? !fieldDef.conditions.some((c) => checkCondition(c, formManager.state))
            : undefined
        );
        const valueHandlers = setValue !== null ? {
            onChange: setValue,
            value: value || fieldDef.default,
        } : {};
        return (
            <>
                <FieldView fieldDef={fieldDef} widget={widget} {...valueHandlers} disabled={disabled}/>
                {errors.length > 0 ? <div className="p-2 has-background-warning has-text-white">
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
