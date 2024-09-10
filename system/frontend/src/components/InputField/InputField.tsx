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
            <label htmlFor={id}>{label}</label>
            <input type={type} id={id} name={name} required={required} />
        </>
    )
}