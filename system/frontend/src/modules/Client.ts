import React from "react";

export type Description = {
    label: string;
    description?: string;
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
    getResults(values: Record<string, string>): Promise<Entry<T | Waiting>[]>;
}

export class HttpClientAPI<T> implements ClientAPI<T>{
    public id: string;
    private _rootUrl: string;

    constructor(id: string, rootUrl: string) {
        this.id = id;
        this._rootUrl = rootUrl;
    }

    async getResults(values: Record<string, string>): Promise<Entry<T | Waiting>[]> {
        const url = new URL(this._rootUrl);
        url.search = (new URLSearchParams(values)).toString();
        return await (await fetch(url.toString())).json()
    }
}

export const ClientContext = React.createContext<ClientAPI<any>>({
    id: "none",
    getResults: async (...args) => {
        console.log(args);
        return [];
    },
});

export function useClient() {
    const client = React.useContext(ClientContext);
    return client;
}