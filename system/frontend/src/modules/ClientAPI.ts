export type Description = {
    label: string;
    description?: string;
}

export type Option<T> = {
    value: T;
    label: string;
}

export type FieldRef = (
    {
        id: string;
    } &
    (
        {
            view: "input" | "checkbox" | "dropdown" | "textarea",
        } | Waiting
    )
);

export type FieldGroup = Description & {
    fields: (Description & FieldRef)[];
}

export type FieldValueSpec = {
    id: string;
    value: any;
    options?: Option<any>[];
    allowMulti?: true;
}

export type Field = Description & FieldRef & FieldValueSpec;

export type FieldValue = Pick<Field, "id" | "value">;

export type Entry<T> = Description & {
    id: string;
    content: T;
}

export type Waiting = {
    view: "waiting";
    value: string;
}

export interface ClientAPI<T> {
    id: string;
    getGroups(): FieldGroup[];
    getInitialValues(): Record<string, FieldValueSpec>;
    getValues(values: Record<string, FieldValue>, value: FieldValue): Record<string, FieldValueSpec>;
    getResults(values: Record<string, FieldValue>): Entry<T | Waiting>[];
}

export class StaticClientAPI<T> implements ClientAPI<T>{
    private _fieldGroups: FieldGroup[];
    private _initialValues: Record<string, FieldValueSpec>;
    readonly id: string;

    constructor(id: string, fieldGroups: FieldGroup[], initialValues: Record<string, FieldValueSpec>) {
        this.id = id;
        this._fieldGroups = fieldGroups;
        this._initialValues = initialValues;
    }

    getGroups(): FieldGroup[] {
        return this._fieldGroups;
    }
    getInitialValues(): Record<string, FieldValueSpec> {
        return this._initialValues;
    }
    getValues(values: Record<string, FieldValue>, value: FieldValue): Record<string, FieldValueSpec> {
        return {
            ...values,
            [value.id]: {
                ...(values[value.id] || {}),
                ...value.value
            }
        }
    }
    getResults(_values: Record<string, FieldValue>): Entry<T | Waiting>[] {
        return [
            {
                id: "waiting",
                label: "Waiting",
                content: {
                    view: "waiting",
                    value: "This is just mock data"
                }
            }
        ]
    }
}