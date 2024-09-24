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
            <div className="field">
                <div className="control">
                    <label className="checkbox" htmlFor={id}>
                        {label}
                        <input
                            type="checkbox"
                            id={id}
                            name={name}
                            required={required}
                            className="plp-checkbox"
                        />
                    </label>
                </div>
            </div>
        </>

    )
}