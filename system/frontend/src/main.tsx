import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {InputField} from "./components/InputField/InputField";
import {CheckBox} from "./components/Checkbox/CheckBox";
import {DropDown} from "./components/Dropdown/DropDown";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <header>
          <h1>ISS probe design</h1>
          <nav>
              <ul>
                  <li>
                      <a href="https://github.com/NBISweden/PLP_Design_Portal">
                          View on GitHub
                      </a>
                  </li>
              </ul>
          </nav>
      </header>
      <main>
          <section>
              <h2>Input</h2>
              <form>
                  <fieldset>
                      <legend>Input</legend>
                        <InputField type={"text"} labelText={'Text:'}/>
                        <CheckBox labelText={'FASTA input: Source sequence is absent in reference genome:'}/>
                  </fieldset>
                  <fieldset>
                      <legend>Distance</legend>
                        <DropDown options={[0,1]} labelText={'Choose an option:'}/>
                  </fieldset>
                  <button type="submit">Submit</button>
              </form>
          </section>
      </main>
      <footer>
          <p>Provided by NBIS system development</p>
      </footer>

  </StrictMode>,
)
