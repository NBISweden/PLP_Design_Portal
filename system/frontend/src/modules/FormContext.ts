import React from "react";


export type FormManager = {
    getValue(id: string): string | number;
    setValue(id: string, value: string | number): void;
    state: Record<string, string | number>;
}

export const FormContext = React.createContext<FormManager | null>(null);

export function useFormManager(defaultState: FormManager["state"] = {}) {
    const [formState, setFormState] = React.useState<FormManager["state"]>(defaultState);
    const formManager = React.useMemo<FormManager>(() => ({
        setValue(id, value) {
            setFormState((state) => ({...state, [id]: value}))
        },
        getValue(id) {
            return formState[id];
        },
        state: formState,
    }), [formState, setFormState]);
    return formManager;
}

export function useFormContext() {
    return React.useContext(FormContext);
}

export function useFormFieldValue(id: string): [string | number, (v: string | number) => void] | [null, null] {
    const formManager = useFormContext();
    const setValue = React.useCallback((value: string | number) => {
        if (formManager) {
            formManager.setValue(id, value)
        }
    }, [formManager, id]);

    return (formManager ? [formManager.getValue(id), setValue] : [null, null])
}
