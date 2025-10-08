import { useEffect } from 'react'
import { Header, MenuItem } from "../Header/Header";
import { Service } from "../Service/Service";
import { Result, ResultList } from "../Result/Result";
import { useClient } from "../../modules/Client";
import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    useLocation,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import {Footer} from "../Footer/Footer";
import { useRouteError } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: "/",
        element: <AppCore />,
        errorElement: <ErrorHandler />,
        children: [
            {
                path: "/",
                element: <Service />,
            },
            {
                path: "/results/",
                element: <ResultList />,
            },
            {
                path: "/results/:resultId",
                element: <Result />,
            },
        ],
    },
]);


export function App() {
    return <RouterProvider router={router} />
}

function AppCore() {
    return <AppBase><Outlet /></AppBase>
}

function AppBase({children}: {children: React.ReactNode}) {
    const {t} = useTranslation();
    const client = useClient();
    const title = t("service.title");
    const location = useLocation();
    const menuItems: MenuItem[] = [
        {
            label: "Service",
            status: location.pathname === "/" ? "active" : undefined,
            link: "/",
        },
        {
            label: "Result History",
            status: location.pathname === "/results/" ? "active" : undefined,
            link: "/results/",
        },
        ...client.links.map(link => ({
            label: t(`links.${link.id}`),
            href: link.href,
            icon: link.icon,
        })),
    ]

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
                {children}
            </main>
            <Footer/>
        </>
    );
}

export function ErrorHandler() {
    const error = useRouteError();
    const {t} = useTranslation();

    const errorObject = typeof error === 'object' && error !== null ? error : null
    const statusText = errorObject && "statusText" in errorObject ? "" + errorObject.statusText : null;
    const message = errorObject && "message" in errorObject ? "" + errorObject.message : null;

    return (
        <AppBase>
            <section className="section has-background-custom-grey-light">
                <div className="container">
                    <h2 className="title is-size-4-mobile has-text-centered">{t("service.error_title")}</h2>
                    <p>{statusText || message}</p>
                </div>
            </section>
        </AppBase>
    );
}
