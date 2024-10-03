import React from "react";


export type FieldDef = {
    id: string;
    required?: boolean;
} & ({
    type: "choice",
    options: string[] | number[];
    default?: string;
} | {
    type: "text";
    default?: string;
    placeholder?: string;
} | {
    type: "number";
    default?: number;
    placeholder?: number;
} | {
    type: "yesno";
    default?: boolean;
});


export interface FieldManager {
    getField(id: string, type?: FieldDef["type"]): FieldDef;
    listFields(): FieldDef[];
}


export class StaticFieldManager implements FieldManager {
    private _fields: FieldDef[];

    constructor(fields: FieldDef[]) {
        this._fields = fields;
    }

    listFields() {
        return this._fields;
    }

    getField(id: string, type?: FieldDef["type"]) {
        const fieldDefs = this._fields;
    
        const fieldDef: FieldDef | undefined = fieldDefs.filter(
            fd => fd.id === id && (!type || fd.type === type)
        )[0];
        if (fieldDef === undefined) {
            throw new Error(`No field with specified requirement found: id: ${id} type: ${type}`)
        } else {
            return fieldDef;
        }
    }
}


export const FieldContext = React.createContext<FieldManager>({
    getField(id: string, _type?: FieldDef["type"]) {
        throw new Error(`Missing field: ${id}`)
    },
    listFields() {
        return [];
    }
});


export function useField(id: string, type?: FieldDef["type"]): FieldDef {
    const ctx = React.useContext(FieldContext);
    return ctx.getField(id, type);
}

export function useFields() {
    const ctx = React.useContext(FieldContext);
    return ctx.listFields();
}