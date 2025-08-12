import React from "react";
import { Result, BasicContent, Entry } from "../../modules/Client"


interface ResultManager<T extends Entry> {
    addResult(result: Result<T>): {id: string};
    getResult(ref: {id: string}): {id: string; result: Result<T>};
    results(): {id: string}[];
}

export type ResultCache<T extends Entry> = {
    [id: string]: {result: Result<T>}
}

export function useCachingResultManager<T  extends Entry>(
    initialResults: ResultCache<T> = {},
    onChange?: (results: ResultCache<T>) => void 
) {
    const [results, setResults] = React.useState<ResultCache<T>>(initialResults)
    const timerRefs = React.useRef<{[x: string]: number | null | "updating"}>({});

    React.useEffect(() => {
        if (onChange) {
            onChange(results);
        }
    }, [onChange, results])

    return {
        addResult(result: Result<T>): {id: string} {
            const id: string = result.id;
            setResults((r) => ({
                ...r,
                [id]: {
                    result: result
                }
            }));
            return {id};
        },
        getResult(ref: {id: string}): {id: string; result: Result<T>} {
            const result = results[ref.id];
            const updateResults = async () => {
                timerRefs.current[ref.id] = "updating"
                try {
                    const deferredUrl = "url" in result.result ? result.result.url : null;
                    const updatedResults = await (
                        deferredUrl ? await fetchJson<Result<T>>(deferredUrl) : Promise.resolve(result.result)
                    )

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
            if ("refresh_rate" in result.result) {
                const refreshRate = result.result.refresh_rate || 5000;
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
