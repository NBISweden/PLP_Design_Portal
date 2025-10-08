import "./Header.css";
import { Link } from 'react-router-dom';

export type MenuItem = {
    status?: "active";
    label: string;
    icon?: string;
} & (
    {
        href: string;
    } | {
        onClick: () => void;
    } | {
        link: string;
    }
)

interface Props {
    title: string;
    subtitle: string;
    menuItems: MenuItem[];
}

export function Header({title, subtitle, menuItems}: Props) {
    return (
        <header
            className="header p-4 p-3-mobile header-image"
        >
            <div className="container">
                <div className="columns is-vcentered is-centered">

                    <div className="column is-one-third">
                        <h1 className="title is-size-3">{title}</h1>
                        <div className="is-flex is-align-items-center">
                            <p className="subtitle mr-4">{subtitle}</p>
                        </div>
                    </div>
                    <div className="column is-flex is-justify-content-flex-end is-one-third">
                        <nav>
                            <ul className="is-flex is-flex-wrap-wrap is-justify-content-flex-end">
                                {menuItems.map((item, index) => (
                                    <li key={index} className={`header-nav px-2 py-1 ml-2 ${item.status === "active" ? "active" : ""}`}>
                                        {"href" in item && (
                                            <a href={item.href} className="is-size-6 ">
                                                {item.icon && <i className={`${item.icon} mr-2`} aria-hidden="true"></i>}
                                                {item.label}
                                            </a>
                                        )}
                                        {"onClick" in item && (
                                            <a onClick={item.onClick} className="is-size-6 ">
                                                {item.label}
                                            </a>
                                        )}
                                        {"link" in item && (
                                            <Link to={item.link}>{item.label}</Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}
