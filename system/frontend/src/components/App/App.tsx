import { Header, MenuItem } from "../Header/Header";
import { Service } from "../Service/Service";
import { Result } from "../Result/Result";
import {
    createBrowserRouter,
    RouterProvider,
    redirect,
} from "react-router-dom";
import "./App.css";
import {Footer} from "../Footer/Footer";


export function App(_props: {}) {
    const menuItems: MenuItem[] = [
        {
            label: "View on GitHub",
            href: "https://github.com/NBISweden/PLP_Design_Portal"
        },
    ]
    const router = createBrowserRouter([
        {
            path: "/",
            loader: async () => redirect("/services/plp")
        },
        {
            path: "/services/plp",
            element: <Service />,
        },
        {
            path: "/results",
            element: <Result />,
        },
    ]);

    return (
        <>
            <Header title="ISS Probe design" subtitle="Design padlock probes for in-situ sequencing"
                    menuItems={menuItems}/>
            <main>
                <RouterProvider router={router} />
            </main>
            <Footer/>
        </>

    );
}