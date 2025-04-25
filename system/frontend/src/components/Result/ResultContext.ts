import React from "react";
import { Query, Result, BasicContent, ErrorContent } from "../../modules/Client"


interface ResultManager<T> {
    addResult(query: Query<Result<T>>, namespace?: string): {id: string};
    getResult(ref: {id: string}): {id: string; result: Result<T>};
    results(): {id: string}[];
}

export type ResultCache<T> = {
    [id: string]: {result: Result<T>}
}

export function useCachingResultManager<T>(
    initialResults: ResultCache<T | ErrorContent> = {},
    initialEnumerator: number = 0,
    onChange?: (results: ResultCache<T | ErrorContent>, enumerator: number) => void 
) {
    const [results, setResults] = React.useState<ResultCache<T | ErrorContent>>(initialResults)
    const [enumerator, setEnumerator] = React.useState<number>(initialEnumerator);

    React.useEffect(() => {
        if (onChange) {
            onChange(results, enumerator);
        }
    }, [onChange, results, enumerator])

    return {
        addResult(query: Query<Result<T | ErrorContent>>, namespace: string ="result"): {id: string} {
            setEnumerator(enumerator + 1)
            const id: string = `${namespace}-${enumerator}`
            setResults((r) => ({
                ...r,
                [id]: {
                    result: []
                }
            }));
            query.get().then((result) => {
                setResults((r) => ({
                    ...r,
                    [id]: {
                        result: result
                    }
                }));
            }).catch((e) => {
                const errorResult: Result<ErrorContent> = [
                    {
                        id: `error-${id}`,
                        label: "Error",
                        description: e.toString(),
                        content: {type: "error"},
                    }
                ]
                setResults((r) => ({
                    ...r,
                    [id]: {
                        result: errorResult
                    }
                }));
            });
            return {id};
        },
        getResult(ref: {id: string}): {id: string; result: Result<T | ErrorContent>} {
            return {
                id: ref.id,
                ...results[ref.id]
            };
        },
        results(): {id: string}[] {
            return Object.keys(results).map(id => ({id}));
        }
    }
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
