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
        <header className="header has-background-light">
            <div className="container">
                <div className="columns is-vcentered">

                    <div className="column is-offset-1">
                        <h1 className="title is-size-3 has-text-grey-dark">{title}</h1>
                        <div className="is-flex is-align-items-center">
                            <p className="subtitle is-size-5 mr-4">{subtitle}</p>
                        </div>
                    </div>
                    <div className="column is-flex is-offset-3">
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