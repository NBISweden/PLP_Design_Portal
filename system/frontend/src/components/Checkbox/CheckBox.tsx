import React, { useState, useCallback, ChangeEvent } from "react";
import './Checkbox.css'

type Option = {label?: string, value: string | number};

type BaseProps = {
    label: string;
    required?: boolean;
    name?: string;
    options: [Option, Option];
    disabled?: boolean;
}

type StatefulProps = BaseProps & {
    defaultValue?: Option["value"];
}

type Props = BaseProps & {
    onChange: (value: Option["value"]) => void;
    value: Option["value"];
}

export function StatefulCheckBox({label, required, options, name, defaultValue, disabled}: StatefulProps) {
    const primary = options[0];
    const [value, setValue] = useState(defaultValue || primary.value);

    return (
        <CheckBox
            label={label}
            required={required}
            name={name}
            options={options}
            disabled={disabled}
            onChange={setValue}
            value={value}
        />
    )
}

export function CheckBox({label, required, options, name, disabled, onChange, value}: Props) {
    const id = React.useId()
    const primary = options[0];
    const secondary = options[1];
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onChange(
            event.currentTarget.checked ? primary.value : secondary.value
        )
    }, [primary, secondary, onChange]);

    return (
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
    )
}
