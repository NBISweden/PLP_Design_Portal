
import React from "react";
import './DropDown.css'

interface Props {
    options?: {label: string, value: string | number}[];
    range?: { start: number; end: number };
    label: string;
    required?: boolean;
    name?: string;
}

export function DropDown( {options, label, required, name, range}: Props){
    const id = React.useId();

    const generateRangeOptions = (start: number, end: number) => {
        return Array.from({ length: end - start + 1 }, (_, i) => ({
            value: start + i,
            label: `${start + i}`,
        }));
    };

    const dropdownOptions = range
        ? generateRangeOptions(range.start, range.end)
        : options || [];

    return (
        <>
            <div className="field">
                <label className="label" htmlFor={id}>{label}</label>
                <div className="control">
                    <div className="select is-fullwidth">
                        <select id={id} name={name} required={required}>
                            {dropdownOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </>
    )
}