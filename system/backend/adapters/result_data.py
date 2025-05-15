from dataclasses import dataclass
from typing import Optional


@dataclass
class TableData:
    headers: dict[str, str]
    entries: list[dict[str, str]]
    type: str = "table"


@dataclass
class FileData:
    base64_data: str
    type: str = "data"


@dataclass
class Result:
    id: str
    label: str
    content: TableData | FileData


@dataclass
class Error:
    id: str
    description: Optional[str]


@dataclass
class FieldError:
    fieldId: str
    id: str
    description: Optional[str]


@dataclass
class ErrorResult:
    errors: list[Error | FieldError]
