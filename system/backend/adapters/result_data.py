from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class TableData:
    headers: dict[str, str]
    entries: list[dict[str, str]]
    type: str = "table"


@dataclass
class DeferredStatus:
    progress: int
    description: str

    @staticmethod
    def from_data(data: dict):
        return DeferredStatus(
            progress=int(data["progress"]),
            description=str(data["description"])
        )


@dataclass
class DeferredResult:
    status: list[DeferredStatus]
    id: str
    url: str
    type: str = "deferred"

    @staticmethod
    def from_data(data: dict):
        status = [
            DeferredStatus.from_data(s)
            for s in data["status"]
        ]
        return DeferredResult(
            id=str(data["id"]),
            url=str(data["url"]),
            status=status
        )


@dataclass
class FileData:
    base64_data: str
    type: str = "data"


@dataclass
class Result:
    id: str
    label: str
    content: TableData | FileData | DeferredResult


@dataclass
class Error:
    id: str
    description: Optional[str] = None


@dataclass
class FieldError:
    fieldId: str
    id: str
    description: Optional[str] = None


@dataclass
class ErrorResult:
    errors: list[Error | FieldError]


def result_to_data(result: Result) -> dict:
    return asdict(result)


def result_data_from_data(data):
    result_type = data["type"]
    if result_type == "deferred":
        return DeferredResult.from_data(data)
    elif result_type == "table":
        return TableData(**data)
    elif result_type == "data":
        return FileData(**data)
