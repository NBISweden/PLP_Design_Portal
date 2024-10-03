import { InputField, CheckBox, DropDown} from "../Fields"
import { useField, FieldDef } from "./FieldContext";
import { useTranslation } from "react-i18next";


export function FieldView(props: {
    fieldDef: FieldDef,
    widget?: (props: any) => JSX.Element
}) {
    const {t} = useTranslation();
    const fieldDef = props.fieldDef;
    const widget = props.widget;
    const label = t(`fields.${fieldDef.id}.label`);
    const name = fieldDef.id;
    const defaultValue = fieldDef.default;
    const options = (
        fieldDef.type == "choice"
        ? fieldDef.options.map(o => ({
            value: o,
            label: t(`fields.${fieldDef.id}.options.${o}`)
        }))
        : []
    );

    if (widget !== undefined) {
        return widget({label, type: fieldDef.type, name, default: defaultValue, options})
    } else {
        switch (fieldDef.type) {
            case "choice": {
                return <DropDown label={label} name={name} options={options}/>
            }
            case "number": {
                const placeholder = fieldDef.placeholder === undefined ? "" : `${fieldDef.placeholder}`;
                return <InputField type="number" name={name} label={label} placeholder={placeholder}/>
            }
            case "text": {
                return <InputField type="text" name={name} label={label} placeholder={fieldDef.placeholder}/>
            }
            case "yesno": {
                return <CheckBox name={name} label={label} />
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
    widget?: (props: any) => JSX.Element
}) {
    const {id, widget} = props;
    try {
        const fieldDef = useField(id);
        return (
            <FieldView fieldDef={fieldDef} widget={widget}/>
        )
    } catch(e: any) {
        const message = "message" in e ? e.message : "Failed to get field";
        return (
            <MissingField id={id} message={message}/>
        );
    }
}