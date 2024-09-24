import React from "react";
import './InputField.css'

interface Props {
    type: 'text' | 'number';
    label: string;
    required?: boolean;
    name?: string;
}

export function InputField({type, label, required, name}: Props) {
    const id = React.useId();
    return (
        <>
            <div className="field">
                <label className="label" htmlFor={id}>{label}</label>
                <div className="control">
                    <input className="input" type={type} id={id} name={name} required={required} />
                </div>
            </div>
        </>

    )
}