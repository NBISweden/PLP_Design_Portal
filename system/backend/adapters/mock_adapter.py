from .result_data import Result, TableData

class MockAdapter:
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
                "form": {
                    "groups": {
                        "group_a": "Group A",
                    },
                    "submit": "Engage",
                    "show_example": "Show example"
                },
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

    layout = [
        {
            "id": "group_a",
            "fields": [
                {"type": "field", "id": "hello.world"}
            ]
        }
    ]

    info = {
        "name": name,
        "description": "Mock Search",
        "version": "0.0.1"
    }

    def run(self, data) -> list[Result]:
        return [
            Result(
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
            ),
            Result(
                id="mock-search",
                label="Another result",
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
        ]


adapter = MockAdapter()
