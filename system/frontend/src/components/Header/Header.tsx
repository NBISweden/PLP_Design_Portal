export type MenuItem = {
    label: string;
} & (
    {
        href: string;
    } | {
    onClick: () => void;
}
    )

interface Props {
    title: string;
    subtitle: string;
    menuItems: MenuItem[];
}

export function Header({title, subtitle, menuItems}: Props) {
    return (
        <header className="header p-4 p-3-mobile has-background-light">
            <div className="container">
                <div className="columns is-vcentered is-centered">

                    <div className="column is-one-third">
                        <h1 className="title is-size-3 has-text-grey-dark">{title}</h1>
                        <div className="is-flex is-align-items-center">
                            <p className="subtitle mr-4">{subtitle}</p>
                        </div>
                    </div>
                    <div className="column is-flex is-justify-content-flex-end is-one-third">
                        <nav>
                            <ul className="is-flex">
                                {menuItems.map((item, index) => (
                                    <li key={index} className="ml-4">
                                        {"href" in item ? (
                                            <a href={item.href} className="is-size-6 has-text-grey-dark">
                                                {item.label}
                                            </a>
                                        ) : (
                                            <a onClick={item.onClick} className="is-size-6 has-text-grey-dark">
                                                {item.label}
                                            </a>
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