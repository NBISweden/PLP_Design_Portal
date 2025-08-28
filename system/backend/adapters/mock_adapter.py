from .result_data import (
    Result,
    DeferredResult,
    ErrorResult,
    Error,
    FieldError,
    TableData,
    StatusData,
    StatusEntry,
)
import json
import os
import random
import uuid


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

    def run(self, data, result_manager) -> Result | DeferredResult | ErrorResult:
        unique_id = str(uuid.uuid4())
        self._last_data = data
        field_ids = [field["id"] for field in self._fields]
        result_choice = random.choice(["error", "success", "deferred"])
        error_result = ErrorResult(
            label="Error",
            id=unique_id,
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
        success_result = Result(
            id=unique_id,
            label="Mock Search",
            items=[
                TableData(
                    label="Mock table",
                    id="data",
                    headers={
                        "value": "Value",
                        "param": "Param"
                    },
                    entries=[
                        {"param": param, "value": value}
                        for param, value in data.items()
                    ]
                )
            ]
        )
        result_context = result_manager.create_context(label="Deferred result")
        result_context.set_item(
            StatusData(
                id="status",
                label="Mock status",
                status=[
                    StatusEntry(
                        progress=100,
                        description="Success"
                    )
                ]
            )
        )
        deferred_result = result_context.get_result()

        result_selector: dict[str, Result | ErrorResult] = {
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
