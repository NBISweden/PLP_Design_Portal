import React from "react";
import './Checkbox.css'

interface Props {
    label: string;
    required?: boolean;
    name?: string;
    defaultValue?: boolean;
}

export function CheckBox({label, required, name, defaultValue}: Props) {
    const id = React.useId()
    return (
        <>
            <div className="field">
                <div className="control">
                    <label className="checkbox mr-3" htmlFor={id}>
                        {label}
                    </label>
                    <input
                        type="checkbox"
                        id={id}
                        name={name}
                        checked={defaultValue}
                        required={required}
                        className="plp-checkbox"
                    />
                </div>
            </div>
        </>

    )
}
