import React from "react";
import { Result, BasicContent, ErrorContent, DeferredResult } from "../../modules/Client"


interface ResultManager<T> {
    addResult(result: Result<T | ErrorContent>, namespace?: string): {id: string};
    getResult(ref: {id: string}): {id: string; result: Result<T>};
    results(): {id: string}[];
}

export type ResultCache<T> = {
    [id: string]: {result: Result<T>}
}

export function useCachingResultManager<T extends object>(
    initialResults: ResultCache<T | DeferredResult | ErrorContent> = {},
    initialEnumerator: number = 0,
    onChange?: (results: ResultCache<T | DeferredResult | ErrorContent>, enumerator: number) => void 
) {
    const [results, setResults] = React.useState<ResultCache<T | DeferredResult | ErrorContent>>(initialResults)
    const [enumerator, setEnumerator] = React.useState<number>(initialEnumerator);
    const timerRefs = React.useRef<{[x: string]: number | null | "updating"}>({});

    React.useEffect(() => {
        if (onChange) {
            onChange(results, enumerator);
        }
    }, [onChange, results, enumerator])

    return {
        addResult(result: Result<T | DeferredResult | ErrorContent>, namespace: string ="result"): {id: string} {
            setEnumerator(enumerator + 1)
            const id: string = `${namespace}-${enumerator}`
            setResults((r) => ({
                ...r,
                [id]: {
                    result: result
                }
            }));
            return {id};
        },
        getResult(ref: {id: string}): {id: string; result: Result<T | DeferredResult | ErrorContent>} {
            const result = results[ref.id]
            const updateResults = async () => {
                timerRefs.current[ref.id] = "updating"
                try {
                    const updatedResults = await Promise.all(result.result.map(async r => (
                        "content" in r && "type" in r.content && r.content.type === "deferred" 
                        ? {
                            ...r,
                            content: await fetchJson<T | DeferredResult | ErrorContent>(r.content.url)
                        }
                        : Promise.resolve(r)
                    )))
                    setResults((r) => ({
                        ...r,
                        [ref.id]: {
                            result: updatedResults
                        }
                    }))
                } catch (e) {
                    console.log(e)
                }
                timerRefs.current[ref.id] = null
            }
            const hasDeferred = result.result.some(r => "content" in r && "type" in r.content && r.content.type === "deferred")
            if (hasDeferred) {
                const timerRef = timerRefs.current[ref.id]
                if (typeof(timerRef) === "number") {
                    clearTimeout(timerRef);
                    timerRefs.current[ref.id] = null
                }
                if (timerRef !== "updating") {
                    setTimeout(updateResults, 5000)
                }
            }
            return {
                id: ref.id,
                ...result
            };
        },
        results(): {id: string}[] {
            return Object.keys(results).map(id => ({id}));
        }
    }
}

async function fetchJson<T>(url: string): Promise<T> {
    return await (await fetch(url)).json()
}

export const ResultContext = React.createContext<ResultManager<BasicContent>>({
    addResult(): {id: string} {
        throw new Error("Not implemented");
    },
    getResult(): {id: string; result: Result<BasicContent>} {
        throw new Error("Not implemented");
    },
    results(): {id: string}[] {
        return []
    }
});

export function useResults() {
    const results = React.useContext(ResultContext);
    return results;
}
