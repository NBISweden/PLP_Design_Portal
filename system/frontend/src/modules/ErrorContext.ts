import React from "react";

export type ErrorMessage = {
    id: string;
    description?: string;
}

export type GroupedError = {
    groupId: string | null;
} & ErrorMessage

export interface ErrorManager {
    getFieldErrors(id: string): ErrorMessage[];
    getFormErrors(id?: string): ErrorMessage[];
}

export const ErrorContext = React.createContext<ErrorManager>({
    getFieldErrors() {
        return [];
    },
    getFormErrors() {
        return []
    }
});

export class StaticErrorManager {
    private _errors: GroupedError[];

    constructor(errors: GroupedError[]) {
        this._errors = errors;
    }

    getFieldErrors(id: string) {
        const groupId = `field.${id}`;
        return this._errors.filter(e => e.groupId === groupId);
    }

    getFormErrors(id?: string) {
        const groupId = id ? `form.${id}` : null;
        return this._errors.filter(e => e.groupId === groupId);
    }
}

export function useFieldErrors(id: string): ErrorMessage[] {
    const ctx = React.useContext(ErrorContext);
    return ctx.getFieldErrors(id);
}

export function useFormErrors(): ErrorMessage[] {
    const ctx = React.useContext(ErrorContext);
    return ctx.getFormErrors();
}


export function useStaticErrorManager(): [ErrorManager, (errors: GroupedError[]) => void] {
    const [errorManager, setErrorManager] = React.useState<ErrorManager>(new StaticErrorManager([]));
    const setErrors = (errors: GroupedError[]) => {
        setErrorManager(
            new StaticErrorManager(errors)
        )
    }
    return [
        errorManager,
        setErrors
    ]
}
