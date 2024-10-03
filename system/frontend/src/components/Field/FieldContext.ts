import React from "react";


export type FieldDef = {
    id: string;
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


export type FieldGetter = (id: string, type?: FieldDef["type"]) => FieldDef;


export const FieldContext = React.createContext<{getField: FieldGetter}>({
    getField(id: string, _type?: FieldDef["type"]) {
        throw new Error(`Missing field: ${id}`)
    }
});


export function useField(id: string, type?: FieldDef["type"]): FieldDef {
    const ctx = React.useContext(FieldContext);
    return ctx.getField(id, type);
}