import React from "react";
import { Result, BasicContent, ErrorContent } from "../../modules/Client"


interface ResultManager<T> {
    addResult(result: Result<T | ErrorContent>, namespace?: string): {id: string};
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
        addResult(result: Result<T | ErrorContent>, namespace: string ="result"): {id: string} {
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
