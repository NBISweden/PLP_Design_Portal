import React, { useState, useCallback, ChangeEvent } from "react";
import './Checkbox.css'

type Option = {label?: string, value: string | number};

interface Props {
    label: string;
    required?: boolean;
    name?: string;
    options: [Option, Option];
    defaultValue?: Option["value"];
    disabled?: boolean;
}

export function CheckBox({label, required, options, name, defaultValue, disabled}: Props) {
    const id = React.useId()
    const primary = options[0];
    const secondary = options[1];
    const [value, setValue] = useState(defaultValue || primary.value);
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setValue(
            event.currentTarget.checked ? primary.value : secondary.value
        )
    }, [primary, secondary, setValue])
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
                        checked={value === primary.value}
                        required={required}
                        onChange={handleChange}
                        className="plp-checkbox"
                        disabled={disabled}
                        data-selected-value={value}
                    />
                </div>
            </div>
        </>
    )
}
