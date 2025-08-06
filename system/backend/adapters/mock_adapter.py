from .result_data import (
    Result,
    ErrorResult,
    Error,
    FieldError,
    TableData,
    DeferredStatus
)
import json
import os
import random


class MockAdapter:
    name = "mock_search"

    def __init__(self, data_directory: str):
        self._fields = load_json(os.path.join(data_directory, "fields.json"))
        self._translation = load_json(os.path.join(data_directory, "translation.json"))
        self._layout = load_json(os.path.join(data_directory, "layout.json"))

    @property
    def fields(self):
        return self._fields

    @property
    def translation(self):
        return self._translation

    @property
    def layout(self):
        return self._layout

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

    def run(self, data, result_context) -> list[Result] | ErrorResult:
        self._last_data = data
        field_ids = [field["id"] for field in self._fields]
        result_choice = random.choice(["deferred"])
        error_result = ErrorResult(
            errors=[
                *[
                    FieldError(
                        fieldId=random.choice(field_ids),
                        id="value-error"
                    )
                    for i in range(5)
                ],
                Error(id="general-error")
            ]
        )
        success_result = [
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
        deferred_result_control = result_context.allocate_result()
        deferred_result_control.update_status(
            DeferredStatus(
                progress=100,
                description="Success"
            )
        )
        deferred_result = [
            Result(
                id="mock-deferred",
                label="Mock Deferred",
                content=deferred_result_control.get_result()
            )
        ]

        result_selector: dict[str, list[Result] | ErrorResult] = {
            "error": error_result,
            "success": success_result,
            "deferred": deferred_result
        }

        return result_selector[result_choice]


def load_json(path):
    with open(path) as f:
        return json.load(f)


def create_adapter(data_directory: str = "data"):
    return MockAdapter(data_directory)
