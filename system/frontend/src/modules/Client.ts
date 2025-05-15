import React from "react";
import { FieldDef, FieldManager, StaticFieldManager } from "../components/Fields"
import { Error } from "./ErrorContext"
import { DataOrReference, fetchReference } from "./utils"

export type Description = {
    label: string;
    description?: string;
}

export type Entry<T> = Description & {
    id: string;
    content: T;
}

export interface Query<T> {
    get(): Promise<T>;
}

export type Result<T> = Entry<T>[];

export type FieldError = {
    fieldId: string;
} & Error;

export type ErrorResult = {errors: (Error | FieldError)[]};

export interface ClientAPI<T> {
    id: string;
    query(values: Record<string, string>): Query<Result<T> | ErrorResult>;
    translation: TranslationResource;
    fields: FieldManager;
    links: Link[]
}

type Link = {
    id: string;
    href: string;
    icon: string;
}

type Translation = {
    [x: string]: string | Translation
}

type TranslationResource = {[lang: string]: {translation: Translation}}

export type HttpClientConfig = {
    rootUrl: string,
    id: string,
    language: string,
    links?: Link[],
    translation?: DataOrReference<TranslationResource>,
    fields?: DataOrReference<FieldDef[]>,
}

export class HttpQuery<T> implements Query<Result<T>> {
    private _client: HttpClientAPI<T>;
    private _values: Record<string, string>;
    constructor(client: HttpClientAPI<T>, values: Record<string, string>) {
        this._client = client;
        this._values = values;
    }

    get() {
        return this._client.execute(this._values)
    }
}

export class HttpClientAPI<T> implements ClientAPI<T>{
    public readonly id: string;
    private _rootUrl: string;
    private _translation: TranslationResource = {};
    private _fields: FieldManager = new StaticFieldManager([]);
    private _links: Link[] = [];


    constructor(id: string, rootUrl: string) {
        this.id = id;
        this._rootUrl = rootUrl;
    }

    query(values: Record<string, string>): Query<Result<T> | ErrorResult> {
        return new HttpQuery(this, values);
    }

    get translation() {
        return this._translation;
    }

    get fields() {
        return this._fields;
    }

    get links() {
        return this._links;
    }

    async execute(values: Record<string, string>): Promise<Result<T>> {
        const url = new URL(this._rootUrl, window.location.href);
        url.search = (new URLSearchParams(values)).toString();
        return await (await fetch(url.toString())).json()
    }

    static async fromConfig<T>(config: HttpClientConfig): Promise<HttpClientAPI<T>> {
        const client = new HttpClientAPI<T>(config.id, config.rootUrl);
        const translationRef = config.translation;
        const fieldsRef = config.fields;

        const [translation, fields] = await Promise.all([
            translationRef !== undefined ? fetchReference(translationRef) : Promise.resolve(undefined),
            fieldsRef !== undefined ? fetchReference(fieldsRef) : Promise.resolve(undefined),
        ])

        if (translation) {
            client._translation = translation;
        }
        if (fields) {
            client._fields = new StaticFieldManager(fields);
        }
        if (config.links) {
            client._links = config.links;
        }
        return client;
    }
}

export type TableContent = {
    type: "table",
    headers: {[id: string]: string},
    entries: {[x: string]: string}[]
}

export type ErrorContent = {
    type: "error";
}

export type BasicContent = TableContent | ErrorContent

export const ClientContext = React.createContext<ClientAPI<BasicContent>>({
    id: "none",
    query(values: Record<string, string>) {
        return {
            get() {
                console.log(values);
                return Promise.resolve([]);
            }
        }
    },
    translation: {},
    fields: new StaticFieldManager([]),
    links: [],
});

export function useClient() {
    const client = React.useContext(ClientContext);
    return client;
}
