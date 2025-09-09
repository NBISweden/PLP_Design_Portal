import React from "react";


export type FieldDef = {
    id: string;
    required?: boolean;
    disabled?: boolean;
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


export class DisableFieldManager implements FieldManager {
    private _fieldManager: FieldManager;

    constructor(fieldManager: FieldManager) {
        this._fieldManager = fieldManager;
    }

    listFields() {
        return this._fieldManager.listFields().map<FieldDef>((fd) => ({
            ...fd,
            disabled: true
        }));
    }

    getField(id: string, type?: FieldDef["type"]) {
        const fieldDefs = this._fieldManager.listFields();
    
        const fieldDef: FieldDef | undefined = fieldDefs.filter(
            fd => fd.id === id && (!type || fd.type === type)
        )[0];
        if (fieldDef === undefined) {
            throw new Error(`No field with specified requirement found: id: ${id} type: ${type}`)
        } else {
            return {
                ...fieldDef,
                disabled: true,
            };
        }
    }
}


export const FieldContext = React.createContext<FieldManager>({
    getField(id: string) {
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
