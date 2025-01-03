import React from "react";
import { Query, Result } from "../../modules/Client"


interface ResultManager<T> {
    addResult(query: Query<T>): {id: string};
    getResult(ref: {id: string}): {id: string; result: Result<T>};
    results(): {id: string}[];
}

export type ResultCache<T> = {
    [id: string]: {result: Result<T>}
}

export function createCachingResultManager<T>(
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
        addResult(query: Query<Result<T>>): {id: string} {
            setEnumerator(enumerator + 1)
            const id: string = `result-${enumerator}`
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


export const ResultContext = React.createContext<ResultManager<any>>({
    addResult(_query: Query<Result<any>>): {id: string} {
        throw new Error("Not implemented");
    },
    getResult(_ref: {id: string}): {id: string; result: Result<any>} {
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