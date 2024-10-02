import React from "react";
import './InputField.css'

type Props = ({
        label: string;
        required?: boolean;
        name?: string;
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
    const {label, required, name, placeholder} = props;
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
                            required={required}
                            className="textarea"
                            placeholder={placeholder}
                        ></textarea>
                    ) : (
                        <input
                            type={props.type}
                            id={id}
                            name={name}
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