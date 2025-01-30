import React from "react";

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

export interface ClientAPI<T> {
    id: string;
    query(values: Record<string, string>): Query<Result<T>>;
}

export class HttpClientAPI<T> implements ClientAPI<T>{
    public id: string;
    private _rootUrl: string;

    constructor(id: string, rootUrl: string) {
        this.id = id;
        this._rootUrl = rootUrl;
    }

    query(values: Record<string, string>): Query<Result<T>> {
        const client = this;
        return {
            get() {
                return client._getResults(values)
            }
        }
    }

    private async _getResults(values: Record<string, string>): Promise<Result<T>> {
        const url = new URL(this._rootUrl);
        url.search = (new URLSearchParams(values)).toString();
        return await (await fetch(url.toString())).json()
    }
}

export const ClientContext = React.createContext<ClientAPI<any>>({
    id: "none",
    query(values: Record<string, string>) {
        return {
            get() {
                console.log(values);
                return Promise.resolve([]);
            }
        }
    },
});

export function useClient() {
    const client = React.useContext(ClientContext);
    return client;
}