from .result_data import Result, TableData


name = "mock_search"


fields = [
    {
        "id": "hello.world",
        "type": "text",
        "placeholder": "Hello world Hu-man!",
        "required": True
    },
]

links = [
    {
        "id": "github",
        "href": "https://github.com/NBISweden/PLP_Design_Portal",
        "icon": "fa-brands fa-github",
    }
]


translation = {
    "en": {
        "translation": {
            "results": {
                "title": "Results",
                "download_file": "Download '{{name}}'"
            },
            "form": {},
            "service": {
                "title": "Mock service",
                "subtitle": "Hello world!"
            },
            "fields": {
                "hello.world.label": "Hello world!",
            },
            "links": {
                "github": "View on GitHub"
            }
        }
    }
}


info = {
    "name": name,
    "description": "Mock Search",
    "version": "0.0.1"
}


def service(data):
    return Result(
        id="mock-search",
        label="Mock Search",
        content=TableData(
            headers={
                "value": "Value",
                "param": "Param"
            },
            entries=[
                {"param": param, "value": value}
                for param, value in data.items()
            ]
        )
    )
