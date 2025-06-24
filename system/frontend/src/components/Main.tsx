import { useMemo } from 'react'
import { App } from "./App/App";
import { ResultContext, ResultCache, useCachingResultManager } from "./Result/ResultContext"
import { BasicContent } from '../modules/Client';

export function Main(props: {resultDataId: string}) {
    const {resultDataId} = props;
    const initialData = useMemo<{results: ResultCache<BasicContent>, enumerator: number}>(() => {
      const rawData = localStorage.getItem(resultDataId);
      return rawData ? JSON.parse(rawData) : {
        results: {},
        enumerator: 0
      }
    }, [resultDataId]);
    const onCacheUpdated = useMemo(
      () => {
        return (results: ResultCache<BasicContent>, enumerator: number) => {
          const rawData = JSON.stringify({
            results,
            enumerator
          });
          localStorage.setItem(resultDataId, rawData);
        }
      },
      [resultDataId]
    );
    const resultManager = useCachingResultManager<BasicContent>(
      initialData.results,
      initialData.enumerator,
      onCacheUpdated,
    );
    return (
      <ResultContext.Provider value={resultManager}>
        <App />
      </ResultContext.Provider>
    )
  }
