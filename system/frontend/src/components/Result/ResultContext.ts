import React from "react";
import { Result, BasicContent, Entry, ClientAPI } from "../../modules/Client"

export type MissingResult = {
    id: string;
    type: "missing";
    message?: string;
}

export interface ResultSource<T extends Entry> {
    setResult(result: Result<T>): void;
    getResult(ref: {id: string}): Result<T> | MissingResult;
    removeResult(ref: {id: string}): void;
    get results(): {id: string}[];
}

export class LocalStorageResultSource<T extends Entry> implements ResultSource<T> {
    private _namespace?: string;
    constructor(namespace?: string) {
        this._namespace = namespace || "result-cache";
    }
    setResult(result: Result<T>) {
        const rawData = JSON.stringify(result);
        localStorage.setItem(this._getId(result.id), rawData);
    }
    getResult({id}: {id: string}) {
        const rawData = localStorage.getItem(this._getId(id))
        return rawData ? JSON.parse(rawData) : {
            id: id,
            type: "missing"
        }
    }
    removeResult({id}: {id: string}) {
        localStorage.removeItem(this._getId(id));
    }
    get results() {
        const refBase = this._getId("");
        return Object.keys(localStorage).filter(key => key.startsWith(refBase)).map(key => ({id: key.replace(refBase, "")}))
    }

    private _getId(id: string) {
        return `${this._namespace}-${id}`;
    }
}

export function useCachingResultManager<T extends Entry>(
    cache: ResultSource<T>,
    client: ClientAPI<T>
): ResultSource<T> {
    const [update, setUpdate] = React.useState<number>(1);
    const timerRefs = React.useRef<{[x: string]: number | null | "updating"}>({});

    const resultManager = React.useMemo<ResultSource<T>>(() => {
        const updateRotation = 1000;
        return {
            setResult(result: Result<T>): {id: string} {
                const id: string = result.id;
                cache.setResult(result);
                setUpdate((v) => v + 1 % updateRotation);
                return {id};
            },
            getResult(ref: {id: string}): Result<T> | MissingResult {
                const result = cache.getResult({id: ref.id});
                if (!("type" in result)) {
                    const updateResults = async () => {
                        timerRefs.current[ref.id] = "updating"
                        try {
                            const deferredUrl = "url" in result ? result.url : null;
                            const updatedResults = await (
                                deferredUrl ? client.result(ref).get() : Promise.resolve(result)
                            )
                            const currentResult = cache.getResult({id: ref.id})
                            if (!("type" in currentResult)) {
                                cache.setResult(updatedResults);
                                setUpdate(update + 1 % updateRotation);
                            }
                        } catch (e) {
                            console.log(e)
                        }
                        timerRefs.current[ref.id] = null
                    }
                    if ("refresh_rate" in result) {
                        const refreshRate = result.refresh_rate || 5000;
                        const timerRef = timerRefs.current[ref.id]
                        if (typeof(timerRef) === "number") {
                            clearTimeout(timerRef);
                        }
                        timerRefs.current[ref.id] = (
                            timerRef === "updating"
                            ? null
                            : setTimeout(updateResults, refreshRate)
                        );
                    }
                } else {
                    const fetchResult = async () => {
                        timerRefs.current[ref.id] = "updating"
                        try {
                            const updatedResults = await client.result(ref).get();
                            cache.setResult(updatedResults);
                            setUpdate(update + 1 % updateRotation);
                        } catch (e) {
                            console.log(e)
                        }
                        timerRefs.current[ref.id] = null
                    }
                    fetchResult();
                }
                return {
                    ...result,
                    id: ref.id,
                };
            },
            removeResult(ref) {
                cache.removeResult(ref);
                setUpdate(update + 1 % updateRotation);
            },
            get results() {
                return cache.results;
            }
        }
    }, [cache, client, timerRefs, setUpdate, update]);
    return resultManager;
}

export const ResultContext = React.createContext<ResultSource<BasicContent>>({
    setResult(): {id: string} {
        throw new Error("Not implemented");
    },
    getResult(): Result<BasicContent> {
        throw new Error("Not implemented");
    },
    removeResult(): Result<BasicContent> {
        throw new Error("Not implemented");
    },
    results: []
});

export function useResults() {
    const results = React.useContext(ResultContext);
    return results;
}
