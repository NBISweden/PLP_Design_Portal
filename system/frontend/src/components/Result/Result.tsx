import './Result.css'
import { useTranslation } from "react-i18next";
import { useParams } from 'react-router-dom';
import { useResults } from "../Result/ResultContext";
import { BasicContent } from "../../modules/Client";


export function Result() {
    const {t} = useTranslation();
    const {resultId} = useParams();
    const results = useResults();
    const result = resultId ? results.getResult({id: resultId}) : null;

    return (
        <section className="section has-background-custom-grey-light">
            <div className="container">
                <div className="box">
                    <h2 className="title is-size-4-mobile has-text-centered">{t("results.title")}</h2>
                    {result && "items" in result.result ? (
                        result.result.items.map((entry, index) => (
                            <div key={index} className="result-container">
                                <h2 className="title is-size-5-mobile is-size-4 mt-4 has-text-weight-normal">{entry.label}</h2>
                                <ResultEntry {...entry}/>
                            </div>
                        ))
                    ) : null}
                </div>
            </div>
        </section>
    );
}


function ResultEntry(props: BasicContent) {
    switch(props.type) {
        case "table":
            return <TableView headers={props.headers} entries={props.entries} name={props.label}/>
        default:
            return JSON.stringify(props)
    }
}

function tableToTSV(headers: {[id: string]: string}, entries: {[x: string]: string}[], separator: string = "\t"): string {
    const table = [
        Object.values(headers).map((label) => label),
        ...entries.map((entry) => Object.keys(headers).map((id) => entry[id])),
    ]
    return table.map(row => row.join(separator)).join("\n");
}


function downloadData(data: string, mimeType: string, fileName: string) {
    const blob = new Blob([data], {type: mimeType});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
}


function TableView(props: {headers: {[id: string]: string}, entries: {[x: string]: string}[], name?: string}) {
    const {headers, entries} = props;
    const name = props.name || "data";
    const fileName = `${name}.tsv`;
    const {t} = useTranslation();

    function downloadTableTSV() {
        const data = tableToTSV(headers, entries);
        downloadData(data, "text/tab-separated-values", fileName)
    }

    return (
        <>
            <button type="submit" onClick={downloadTableTSV} className="button is-secondary-custom">{t("results.download_file", {name: fileName})}</button>
            <div className="table-container">
                <table className="table is-striped">
                    <thead>
                        <tr>
                            {Object.entries(headers).map(([id, label]) => (
                                <th key={id}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={index}>
                                {Object.keys(headers).map((id) => (
                                    <td key={id}>{entry[id]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
