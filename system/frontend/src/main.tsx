import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from "./components/App/App";
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import './index.css'
import { translationResources, fields as defaultFields } from "./modules/PLP";
import { StaticFieldManager, FieldContext } from "./components/Fields";
import { ClientContext, HttpClientAPI } from './modules/Client';


async function fetchOrDefault<T>(path: string | undefined, defaultData: T): Promise<T> {
  if (path) {
    try {
      const config = await(await fetch(path)).json();
      return config;
    } catch (_e) {}
  }
  return defaultData;
}

async function getConfig(path: string) {
  return await fetchOrDefault<{
    rootUrl: string,
    id: string,
    language: string,
    translationUrl?: string,
    fieldsUrl?: string,
  }>(path, {
    rootUrl: "http://localhost:5000/api/plp_search",
    id: "plp",
    language: "en",
  })
}

async function main() {
  const config = await getConfig("config.json");
  const [resources, fields] = await Promise.all([
    await fetchOrDefault(config.translationUrl, translationResources),
    await fetchOrDefault(config.fieldsUrl, defaultFields),
  ])
  i18next.use(initReactI18next).init({
    lng: config.language || "en",
    resources: resources,
  })
  const fieldManager = new StaticFieldManager(fields);
  const clientAPI = new HttpClientAPI(config.id, config.rootUrl);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ClientContext.Provider value={clientAPI}>
        <FieldContext.Provider value={fieldManager}>
          <App />
        </FieldContext.Provider>
      </ClientContext.Provider>
    </StrictMode>,
  );
}

main();