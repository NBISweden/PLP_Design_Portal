import './Checkbox.css'

interface Props {
    labelText: string
}

export function CheckBox({labelText}: Props) {
    return (
        <>
            <label htmlFor="checkbox">
                {labelText}
                <input type="checkbox" id="checkbox" name="checkbox" />
            </label>
        </>
    )
}