import uuid
import os
from pydantic import BaseModel, PositiveInt
from .result_data import (
    StatusData,
    TableData,
    FileData,
    Result,
    DeferredResult,
)
from multiprocessing import Lock
import functools


@functools.cache
def get_id_lock(id: str):
    return Lock()


class ResultContext(BaseModel):
    id: str
    url: str
    path: str
    refresh_rate: PositiveInt

    class Config:
        frozen = True

    def get_result(self) -> Result | DeferredResult:
        result = self.__read()
        is_deferred = any([
            isinstance(item, StatusData)
            for item in result.items
        ])

        return (
            result
            if is_deferred
            else Result(**result.model_dump())
        )

    def set_label(self, label: str):
        result = self.__read()
        self.__write(result.copy(update={"label": label}))

    def set_item(self, data: TableData | FileData | StatusData):
        result = self.__read()
        self.__write(result.set_item(data))

    def __write(self, data: DeferredResult):
        with get_id_lock(self.path):
            with open(self.path, "w") as f:
                return f.write(data.model_dump_json())

    def __read(self):
        with get_id_lock(self.path):
            try:
                with open(self.path, "r") as f:
                    return DeferredResult.model_validate_json(f.read())
            except FileNotFoundError:
                return DeferredResult(
                    **self.model_dump(),
                    label="",
                    items=[]
                )


class ResultManager:
    def __init__(self, url_format: str, result_root: str):
        self.__url_format = url_format
        self.__result_root = result_root

    def _create_id(self):
        return str(uuid.uuid4())

    def _get_result_path(self, result_id: str):
        result_id = str(uuid.UUID(result_id))
        return os.path.join(self.__result_root, result_id)

    def create_context(self, label: str):
        id = self._create_id()
        return self.get_context(id)

    def get_context(self, id: str):
        path = self._get_result_path(id)
        url = self.__url_format.format(id=id)
        return ResultContext(id=id, url=url, path=path, refresh_rate=5000)
