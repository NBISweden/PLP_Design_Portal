from pydantic import BaseModel, NonNegativeInt
from typing import Optional
from collections import OrderedDict
from typing import Literal


class ResultData(BaseModel):
    id: str
    label: str

    class Config:
        frozen = True


class TableData(ResultData):
    headers: dict[str, str]
    entries: list[dict[str, str | int | float]]
    type: Literal["table"] = "table"


class StatusEntry(BaseModel):
    progress: NonNegativeInt
    description: str

    class Config:
        frozen = True


class StatusData(ResultData):
    status: list[StatusEntry]
    type: Literal["status"] = "status"


class FileData(ResultData):
    base64_data: str
    type: Literal["data"] = "data"


class Result(BaseModel):
    id: str
    label: str
    items: list[TableData | FileData | StatusData] = []

    class Config:
        frozen = True

    def set_item(self, data: TableData | FileData | StatusData):
        items = OrderedDict((
            (item.id, item)
            for item in self.items
        ))
        items[data.id] = data
        return self.copy(update={"items": list(items.values())})


class DeferredResult(Result):
    url: str
    refresh_rate: int


class Error(BaseModel):
    id: str
    description: Optional[str] = None


class FieldError(BaseModel):
    fieldId: str
    id: str
    description: Optional[str] = None


class ErrorResult(Result):
    errors: list[Error | FieldError]
