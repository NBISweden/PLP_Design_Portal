export type Description = {
    label: string;
    description?: string;
}

export type Option<T> = {
    id: T;
    label: string;
}

export type Field = (
    {
        id: string;
        default: any;
    } &
    Description &
    (
        {
            type: "input";
            valueType: "text" | "number" | "date";
        } |
        {
            type: "choice";
            multi: boolean;
            options: Option<any>[];
        } |
        {
            type: "textarea",
        }
    )
) |
(
    {
        id: string;
    } &
    Waiting
);

export type FieldGroup = Description & {
    fields: Field[];
}

export type FieldValue = Pick<Field, "id"> & {
    value: any;
}

export type Entry<T> = Description & {
    id: string;
    content: T;
}

export type Waiting = {
    type: "waiting";
    value: string;
}

export interface ClientAPI<T> {
    id: string;
    getFields(): FieldGroup[];
    setValue(values: Record<string, FieldValue>, value: FieldValue): Record<string, FieldValue>;
    getResults(values: Record<string, FieldValue>): Entry<T | Waiting>[];
}

export class StaticClientAPI<T> implements ClientAPI<T>{
    private _fieldGroups: FieldGroup[];
    readonly id: string;

    constructor(id: string, fieldGroups: FieldGroup[]) {
        this.id = id;
        this._fieldGroups = fieldGroups;
    }

    getFields(): FieldGroup[] {
        return this._fieldGroups;
    }
    setValue(values: Record<string, FieldValue>, value: FieldValue): Record<string, FieldValue> {
        return {
            ...values,
            [value.id]: value.value
        }
    }
    getResults(_values: Record<string, FieldValue>): Entry<T | Waiting>[] {
        return [
            {
                id: "waiting",
                label: "Waiting",
                content: {
                    type: "waiting",
                    value: "This is just mock data"
                }
            }
        ]
    }
}