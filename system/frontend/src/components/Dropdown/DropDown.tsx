import React from "react";
import './DropDown.css'
import { useState } from "react";

interface Props {
    options?: {label: string, value: string | number}[];
    range?: { start: number; end: number };
    label: string;
    required?: boolean;
    name?: string;
}

export function DropDown( {options, label, name, range}: Props){
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

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(dropdownOptions[0].value); // Default to first option

    const handleDropdownSelection = (e: React.MouseEvent<HTMLAnchorElement>, value: string | number) => {
        e.preventDefault();
        setSelected(value);
        setIsOpen(false); // Close dropdown after selection
    };

    return (
        <>
            <div className="field">
                <label htmlFor={id}>{label}</label>
                <div className="control">
                    <div className={`dropdown is-fullwidth ${isOpen ? "is-active" : ""}`}>
                        <div className="dropdown-trigger">
                            <button className="button is-fullwidth is-flex is-justify-content-space-between" onClick={() => setIsOpen(!isOpen)}>
                                <span>{dropdownOptions.find((opt) => opt.value === selected)?.label || "Select an option"}</span>
                                <span className="icon is-small">
                                <i className="fas fa-angle-down"></i>
                              </span>
                            </button>
                        </div>
                        <div className="dropdown-menu">
                            <div className="dropdown-content">
                                {dropdownOptions.map((option) => (
                                    <a
                                        key={option.value}
                                        href="#"
                                        className={`dropdown-item ${option.value === selected ? "is-active" : ""}`} // Highlight active option
                                        onClick={(e) => handleDropdownSelection(e, option.value)}
                                    >
                                        {option.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Hidden Input to Store Selected Value */}
                <input type="hidden" name={name} value={selected} />
            </div>
        </>
    )
}