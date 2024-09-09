import './DropDown.css'

interface Props {
    options: (string | number)[],
    labelText: string
}

export function DropDown( {options, labelText}: Props){
    return (
        <>
            <label htmlFor="dropdown">{labelText}</label>
            <select id="dropdown" name="dropdown">
                {options.map((option) => (
                    <option value={option}>{option}</option>
                    ))
                }
            </select>
        </>
    )
}