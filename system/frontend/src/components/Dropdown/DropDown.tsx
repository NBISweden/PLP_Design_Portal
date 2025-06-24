import React from "react";
import './DropDown.css'
import { useState } from "react";

interface Props {
    defaultValue?: string | number;
    options?: {label: string, value: string | number}[];
    range?: { start: number; end: number };
    label: string;
    required?: boolean;
    name?: string;
}


function listenForClickOnce(action: () => void) {
    const handleClick = () => {
        action();
        document.removeEventListener("click", handleClick, true);
    }

    document.addEventListener("click", handleClick, true);
}


export function DropDown( {options, label, name, range, defaultValue}: Props){
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

    const selectedDefaultValue = defaultValue === undefined ? dropdownOptions[0]?.value : defaultValue;
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(selectedDefaultValue);

    const handleDropdownSelection = (e: React.MouseEvent<HTMLAnchorElement>, value: string | number) => {
        e.preventDefault();
        setSelected(value);
        setIsOpen(false); // Close dropdown after selection
    };

    const handleClick = () => {
        setIsOpen(!isOpen)
        listenForClickOnce(() => {
            setIsOpen(false)
        })
    }

    return (
        <>
            <div className="field">
                <label htmlFor={id}>{label}</label>
                <div className="control">
                    <div className={`dropdown is-fullwidth ${isOpen ? "is-active" : ""}`}>
                        <div className="dropdown-trigger">
                            <button type="button" className="button is-fullwidth is-flex is-justify-content-space-between" onClick={handleClick}>
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
