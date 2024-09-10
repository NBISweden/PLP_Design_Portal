
import React from "react";
import './DropDown.css'

interface Props {
    options: {label: string, value: string | number}[];
    label: string;
    required?: boolean;
    name?: string;
}

export function DropDown( {options, label, required, name}: Props){
    const id = React.useId();
    return (
        <>
            <label id={id}>{label}</label>
            <select id={id} name={name} required={required}>
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}>{option.label}</option>
                ))}
            </select>
        </>
    )
}