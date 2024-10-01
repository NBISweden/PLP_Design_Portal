import React from "react";
import './InputField.css'

interface Props {
    type: 'text' | 'number';
    label: string;
    required?: boolean;
    name?: string;
    placeholder?: string;
    rows?: number;
    isTextArea?: boolean;
}

export function InputField({type, label, required, name, placeholder,rows, isTextArea}: Props) {
    const id = React.useId();
    return (
        <>
            <div className="field">
                <label htmlFor={id}>{label}</label>
                <div className="control">
                    {isTextArea ? (
                        <textarea
                            id={id}
                            name={name}
                            rows={rows}
                            required={required}
                            className="textarea"
                            placeholder={placeholder}
                        ></textarea>
                    ) : (
                        <input
                            type={type}
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