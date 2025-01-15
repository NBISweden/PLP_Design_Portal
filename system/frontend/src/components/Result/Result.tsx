import { useTranslation } from "react-i18next";

export function Result(_props: {}) {
    const {t} = useTranslation();
    return (
        <section className="section">
            <div className="container">
                <h2 className="title is-size-4-mobile has-text-centered">{t("results.title")}</h2>
                <div className="columns is-centered">
                    <div className="column is-two-thirds">
                        <button type="submit" className="button is-light">Download tsv
                        </button>
                        <div className="table-container">
                            <h2 className="title is-size-5-mobile is-size-4 mt-4 has-text-weight-normal">Padlock probes</h2>
                            <table className="table is-striped">
                                <thead>
                                <tr>
                                    <th>Gene</th>
                                    <th>Symbol</th>
                                    <th>Code</th>
                                    <th>Position</th>
                                    <th>UCSC</th>
                                    <th>Strand</th>
                                    <th>FeatureCoordinates</th>
                                    <th>ProbeSeq</th>
                                    <th>SpacerLeft</th>
                                    <th>AnchorSeq</th>
                                </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>ENSDARG00000007196</td>
                                        <td>rae1</td>
                                        <td>322333</td>
                                        <td>6:20267042	</td>
                                        <td>Link</td>
                                        <td>+</td>
                                        <td>6:20267020-20267124</td>
                                        <td>CCGATGATAGCATAAGCT-GCTTGGCATTTAGTCCTC</td>
                                        <td>TCCTC</td>
                                        <td>TGCGTCTATTTAGTGGAGCC</td>
                                    </tr>
                                    <tr>
                                        <td>ENSDARG00000007196</td>
                                        <td>rae1</td>
                                        <td>322333</td>
                                        <td>6:20267042	</td>
                                        <td>Link</td>
                                        <td>+</td>
                                        <td>6:20267020-20267124</td>
                                        <td>CCGATGATAGCATAAGCT-GCTTGGCATTTAGTCCTC</td>
                                        <td>TCCTC</td>
                                        <td>TGCGTCTATTTAGTGGAGCC</td>
                                    </tr>
                                    <tr>
                                        <td>ENSDARG00000007196</td>
                                        <td>rae1</td>
                                        <td>322333</td>
                                        <td>6:20267042	</td>
                                        <td>Link</td>
                                        <td>+</td>
                                        <td>6:20267020-20267124</td>
                                        <td>CCGATGATAGCATAAGCT-GCTTGGCATTTAGTCCTC</td>
                                        <td>TCCTC</td>
                                        <td>TGCGTCTATTTAGTGGAGCC</td>
                                    </tr>
                                    <tr>
                                        <td>ENSDARG00000007196</td>
                                        <td>rae1</td>
                                        <td>322333</td>
                                        <td>6:20267042	</td>
                                        <td>Link</td>
                                        <td>+</td>
                                        <td>6:20267020-20267124</td>
                                        <td>CCGATGATAGCATAAGCT-GCTTGGCATTTAGTCCTC</td>
                                        <td>TCCTC</td>
                                        <td>TGCGTCTATTTAGTGGAGCC</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}