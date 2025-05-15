import React from "react";
import './InputField.css'

type Props = ({
        label: string;
        required?: boolean;
        name?: string;
        defaultValue?: string | number;
        placeholder?: string;
    } & (
        {
            type: 'text' | 'number';
        } | {
            type: 'textarea';
            rows?: number
        }
    )
)

export function InputField(props: Props) {
    const {label, required, name, placeholder, defaultValue} = props;
    const id = React.useId();
    return (
        <>
            <div className="field">
                <label htmlFor={id}>{label}</label>
                <div className="control">
                    {props.type === "textarea" ? (
                        <textarea
                            id={id}
                            name={name}
                            rows={props.rows}
                            defaultValue={defaultValue}
                            required={required}
                            className="textarea"
                            placeholder={placeholder}
                        ></textarea>
                    ) : (
                        <input
                            type={props.type}
                            id={id}
                            name={name}
                            defaultValue={defaultValue}
                            required={required}
                            className="input"
                            placeholder={placeholder}
                        />
                    )}
                </div>
            </div>
        </>

    )
}
