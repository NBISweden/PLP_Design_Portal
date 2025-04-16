import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import './index.css'
import { FieldContext } from "./components/Fields";
import { Main } from "./components/Main";
import { ClientContext, HttpClientAPI } from './modules/Client';
import { getErrorMessage } from "./modules/utils"


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
  } catch (e: unknown) {
    createRoot(document.getElementById('root')!).render(
      <div>Failed to load App config: {getErrorMessage(e)}</div>
    );
  }
}



main();
