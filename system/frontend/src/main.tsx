import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from "./components/App/App";
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import './index.css'
import { FieldContext } from "./components/Fields";
import { ClientContext, HttpClientAPI } from './modules/Client';
import { ResultContext, ResultCache, createCachingResultManager } from "./components/Result/ResultContext"


async function main() {
  try {
    const config = await (await fetch("config.json")).json();
    const clientAPI = await HttpClientAPI.fromConfig(config);
    i18next.use(initReactI18next).init({
      lng: config.language || "en",
      resources: clientAPI.translation,
    });

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ClientContext.Provider value={clientAPI}>
          <FieldContext.Provider value={clientAPI.fields}>
            <Main resultDataId={"result-cache"}/>
          </FieldContext.Provider>
        </ClientContext.Provider>
      </StrictMode>,
    );
  } catch (e: any) {
    createRoot(document.getElementById('root')!).render(
      <div>Failed to load App config: {e.toString()}</div>
    );
  }
}

function Main(props: {resultDataId: string}) {
  const {resultDataId} = props;
  const initialData = useMemo<{results: ResultCache<any>, enumerator: number}>(() => {
    const rawData = localStorage.getItem(resultDataId);
    return rawData ? JSON.parse(rawData) : {
      results: {},
      enumerator: 0
    }
  }, [resultDataId]);
  const onCacheUpdated = useMemo(
    () => {
      return (results: ResultCache<any>, enumerator: number) => {
        const rawData = JSON.stringify({
          results,
          enumerator
        });
        localStorage.setItem(resultDataId, rawData);
      }
    },
    [resultDataId]
  );
  const resultManager = createCachingResultManager<any>(
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

main();
