import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from "./components/App/App";
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
import './index.css'
import { translationResources, fields } from "./modules/PLP";
import { StaticFieldManager, FieldContext } from "./components/Fields";
import { ClientContext, HttpClientAPI } from './modules/Client';


i18next.use(initReactI18next).init({
  lng: "en",
  resources: translationResources,
})
const fieldManager = new StaticFieldManager(fields);
const clientAPI = new HttpClientAPI("plp", "/api/plp_search");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClientContext.Provider value={clientAPI}>
      <FieldContext.Provider value={fieldManager}>
        <App path="root"/>
      </FieldContext.Provider>
    </ClientContext.Provider>
  </StrictMode>,
)
