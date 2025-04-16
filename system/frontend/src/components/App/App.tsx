import { Header, MenuItem } from "../Header/Header";
import { Service } from "../Service/Service";
import { Result } from "../Result/Result";
import { useClient } from "../../modules/Client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import {Footer} from "../Footer/Footer";


export function App(_props: {}) {
    const {t} = useTranslation();
    const client = useClient();
    const menuItems: MenuItem[] = client.links.map(link => ({
        label: t(`links.${link.id}`),
        href: link.href,
        icon: link.icon,
    }))
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Service />,
        },
        {
            path: "/results/:resultId",
            element: <Result />,
        },
    ]);

    return (
        <>
            <Header
                title={t("service.title")} 
                subtitle={t("service.subtitle")}
                menuItems={menuItems}/>
            <main>
                <RouterProvider router={router} />
            </main>
            <Footer/>
        </>
    );
}
