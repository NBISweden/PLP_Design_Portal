import React, {ChangeEvent, useCallback, useState} from "react";
import './InputField.css'

type BaseProps = ({
        label: string;
        required?: boolean;
        name?: string;
        placeholder?: string;
        disabled?: boolean;
    } & (
        {
            type: 'text' | 'number';
        } | {
            type: 'textarea';
            rows?: number
        }
    )
)

type StatefulProps = BaseProps & {
    defaultValue?: string | number;
}

type Props = BaseProps & {
    onChange: (value: string | number) => void;
    value: string | number;
}

export function StatefulInputField(props: StatefulProps) {
    const {label, required, name, placeholder, defaultValue, disabled} = props;
    const [value, setValue] = useState<string | number>(defaultValue || (props.type === "number" ? 0 : ""));
    return (
        <InputField
            type={props.type}
            value={value}
            onChange={setValue}
            label={label}
            required={required}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
        />
    )
}

export function InputField(props: Props) {
    const {label, required, name, placeholder, disabled, value, onChange} = props;
    const id = React.useId();
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = props.type === "number" ? parseFloat(event.target.value) : event.target.value;
        onChange(newValue)
    }, [onChange, props.type]);
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <div className="control">
                {props.type === "textarea" ? (
                    <textarea
                        id={id}
                        name={name}
                        rows={props.rows}
                        value={value}
                        onChange={handleChange}
                        required={required}
                        className="textarea"
                        placeholder={placeholder}
                        disabled={disabled}
                    ></textarea>
                ) : (
                    <input
                        type={props.type}
                        id={id}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        required={required}
                        className="input"
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                )}
            </div>
        </div>
    )
}
