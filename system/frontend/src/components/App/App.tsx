import { useEffect } from 'react'
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


export function App() {
    const {t} = useTranslation();
    const client = useClient();
    const title = t("service.title");
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
    useEffect(() => {
        document.title = title;
    }, [title])

    return (
        <>
            <Header
                title={title} 
                subtitle={t("service.subtitle")}
                menuItems={menuItems}/>
            <main>
                <RouterProvider router={router} />
            </main>
            <Footer/>
        </>
    );
}
