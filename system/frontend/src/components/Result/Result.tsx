import { useTranslation } from "react-i18next";

export function Result(_props: {}) {
    const {t} = useTranslation();
    return (
        <section className="section">
            <div className="container">
                <h2 className="title is-size-4-mobile has-text-centered">{t("results.title")}</h2>
                <div className="columns is-centered">
                    <div className="column is-two-thirds">
                    </div>
                </div>
            </div>
        </section>
    );
}