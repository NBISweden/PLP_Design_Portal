import React from "react";
import './Checkbox.css'

interface Props {
    label: string;
    required?: boolean;
    name?: string;
}

export function CheckBox({label, required, name}: Props) {
    const id = React.useId()
    return (
        <>
            <label id={id}>
                {label}
                <input
                    type="checkbox"
                    id={id}
                    name={name}
                    required={required}
                />
            </label>
        </>
    )
}