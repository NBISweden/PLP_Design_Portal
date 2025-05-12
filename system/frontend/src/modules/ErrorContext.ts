import React from "react";

export type Error = {
    id: string;
    description?: string;
}

export type GroupedError = {
    groupId: string | null;
} & Error

export interface ErrorManager {
    getFieldErrors(id: string): Error[];
    getFormErrors(id?: string): Error[];
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

export function useFieldErrors(id: string): Error[] {
    const ctx = React.useContext(ErrorContext);
    return ctx.getFieldErrors(id);
}

export function useFormErrors(): Error[] {
    const ctx = React.useContext(ErrorContext);
    return ctx.getFormErrors();
}
