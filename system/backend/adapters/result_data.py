from dataclasses import dataclass


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
