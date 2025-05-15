from .result_data import Result, TableData
import json
import os


class MockAdapter:
    name = "mock_search"

    def __init__(self, data_directory: str):
        self._fields = load_json(os.path.join(data_directory, "fields.json"))
        self._translation = load_json(os.path.join(data_directory, "translation.json"))

    @property
    def fields(self):
        return self._fields
    
    @property
    def translation(self):
        return self._translation

    links = [
        {
            "id": "github",
            "href": "https://github.com/NBISweden/PLP_Design_Portal",
            "icon": "fa-brands fa-github",
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
        ]

def load_json(path):
    with open(path) as f:
        return json.load(f)

def create_adapter(data_directory: str = "data"):
    return MockAdapter(data_directory)
