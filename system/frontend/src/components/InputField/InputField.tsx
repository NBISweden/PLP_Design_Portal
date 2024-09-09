import './InputField.css'

interface Props {
    type: 'text' | 'number',
    labelText: string
}

export function InputField({type, labelText}: Props) {
    return (
        <>
            <label htmlFor="inputField">{labelText}</label>
            <input type={type} id="inputField" name="inputField" required />
        </>

    )
}