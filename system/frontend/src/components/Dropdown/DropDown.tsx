import React from "react";
import './DropDown.css'
import { useState } from "react";

type Option = {label: string, value: string | number};

type BaseProps = {
    options: Option[];
    label: string;
    required?: boolean;
    name?: string;
    disabled?: boolean;
}

type StatefulProps = BaseProps & {
    defaultValue?: Option["value"];
}

type Props = BaseProps & {
    value: Option["value"];
    onChange: (value: Option["value"]) => void;
}


function listenForClickOnce(action: () => void) {
    const handleClick = () => {
        action();
        document.removeEventListener("click", handleClick, true);
    }

    document.addEventListener("click", handleClick, true);
}


export function StatefulDropDown( {options, label, name, defaultValue, disabled}: StatefulProps){
    const selectedDefaultValue = defaultValue === undefined ? options[0]?.value : defaultValue;
    const [selected, setSelected] = useState(selectedDefaultValue);

    return (
        <DropDown
            options={options}
            label={label}
            name={name}
            value={selected}
            disabled={disabled}
            onChange={setSelected}
        />
    )
}


export function DropDown( {options, label, name, disabled, onChange, value}: Props){
    const id = React.useId();
    const [isOpen, setIsOpen] = useState(false);

    const handleDropdownSelection = (e: React.MouseEvent<HTMLAnchorElement>, value: string | number) => {
        e.preventDefault();
        onChange(value);
        setIsOpen(false); // Close dropdown after selection
    }

    const handleClick = () => {
        setIsOpen(!isOpen)
        listenForClickOnce(() => {
            setIsOpen(false)
        })
    }

    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <div className="control">
                <div className={`dropdown is-fullwidth ${isOpen ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}>
                    <div className="dropdown-trigger">
                        <button type="button" className="button is-fullwidth is-flex is-justify-content-space-between" onClick={handleClick}>
                            <span>{options.find((opt) => opt.value === value)?.label || "Select an option"}</span>
                            <span className="icon is-small">
                            <i className="fas fa-angle-down"></i>
                            </span>
                        </button>
                    </div>
                    <div className="dropdown-menu">
                        <div className="dropdown-content">
                            {options.map((option) => (
                                <a
                                    key={option.value}
                                    href="#"
                                    className={`dropdown-item ${option.value === value ? "is-active" : ""}`} // Highlight active option
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
            <input type="hidden" name={name} value={value} disabled={disabled}/>
        </div>
    )
}
