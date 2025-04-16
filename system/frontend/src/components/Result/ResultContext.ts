import React from "react";
import { Query, Result } from "../../modules/Client"


interface ResultManager<T> {
    addResult(query: Query<T>, namespace?: string): {id: string};
    getResult(ref: {id: string}): {id: string; result: Result<T>};
    results(): {id: string}[];
}

export type ResultCache<T> = {
    [id: string]: {result: Result<T>}
}

export function useCachingResultManager<T>(
    initialResults: ResultCache<T> = {},
    initialEnumerator: number = 0,
    onChange?: (results: ResultCache<T>, enumerator: number) => void 
) {
    const [results, setResults] = React.useState<ResultCache<T>>(initialResults)
    const [enumerator, setEnumerator] = React.useState<number>(initialEnumerator);

    React.useEffect(() => {
        if (onChange) {
            onChange(results, enumerator);
        }
    }, [onChange, results, enumerator])

    return {
        addResult(query: Query<Result<T>>, namespace: string ="result"): {id: string} {
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
            });
            return {id};
        },
        getResult(ref: {id: string}): {id: string; result: Result<T>} {
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


export const ResultContext = React.createContext<ResultManager<unknown>>({
    addResult(): {id: string} {
        throw new Error("Not implemented");
    },
    getResult(): {id: string; result: Result<unknown>} {
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
