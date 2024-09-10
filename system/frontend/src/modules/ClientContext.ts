import React from "react";
import { ClientAPI, StaticClientAPI } from "./ClientAPI";

export const ClientContext = React.createContext<ClientAPI<any>>(new StaticClientAPI<any>("mock", []));