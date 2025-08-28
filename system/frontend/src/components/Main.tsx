import { useMemo } from 'react'
import { App } from "./App/App";
import { ResultContext, ResultSource, LocalStorageResultSource, useCachingResultManager } from "./Result/ResultContext"
import { BasicContent, useClient } from '../modules/Client';

export function Main({resultNamespace}: {resultNamespace: string}) {
  const client = useClient();
  const resultCache = useMemo<ResultSource<BasicContent>>(() => {
    return new LocalStorageResultSource<BasicContent>(resultNamespace)
  }, [resultNamespace]);
  const resultManager = useCachingResultManager<BasicContent>(
    resultCache,
    client
  );
  return (
    <ResultContext.Provider value={resultManager}>
      <App />
    </ResultContext.Provider>
  )
}
