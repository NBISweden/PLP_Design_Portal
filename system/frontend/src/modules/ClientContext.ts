import React from "react";
import { ClientAPI, StaticClientAPI } from "./ClientAPI";

export const ClientContext = React.createContext<ClientAPI<any>>(
    new StaticClientAPI<any>(
        "mock",
        [
            {
                label: "Basic values",
                fields: [
                    {
                        label: "Field A",
                        id: "a",
                        view: "checkbox",
                    },
                    {
                        label: "Field B",
                        id: "b",
                        view: "input",
                    },
                    {
                        label: "Field C",
                        id: "a",
                        view: "dropdown",
                    },
                ]
            },
            {
                label: "Expert values",
                fields: [
                    {
                        label: "Field C",
                        id: "c",
                        view: "input",
                    },
                    {
                        label: "Field D",
                        id: "d",
                        view: "input",
                    }
                ]
            }
        ],
        {
            "a": {
                id: "a",
                value: "a.b",
                options: ["a.a", "a.b", "a.c"].map(v => ({label: v, value: v})),
            },
            "b": {
                id: "b",
                value: "b.a",
                options: ["b.a", "b.b"].map(v => ({label: v, value: v})),
            },
            "c": {
                id: "c",
                value: "c.b",
                options: ["c.a", "c.b"].map(v => ({label: v, value: v})),
            },
            "d": {
                id: "d",
                value: "d.a",
                options: ["d.a", "d.b"].map(v => ({label: v, value: v})),
            }
        }
    )
);