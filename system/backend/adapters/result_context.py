import uuid
import os
import json
from .result_data import (
    DeferredResult,
    DeferredStatus,
    TableData,
    FileData,
    result_data_from_data,
    result_to_data
)


class DeferredResultControl:
    __result: TableData | FileData | DeferredResult

    def __init__(self, path: str, id: str, url: str):
        self.__result = DeferredResult(
            id=id,
            url=url,
            status=[]
        )
        self.__path = path

    def get_result(self) -> TableData | FileData | DeferredResult:
        return self.__result

    def update_status(self, status: DeferredStatus):
        if isinstance(self.__result, DeferredResult):
            self.__result.status.append(status)
            self.__write()

    def set_result(self, result: TableData | FileData):
        self.__result = result
        self.__write()

    def __write(self):
        with open(self.__path, "w") as f:
            json.dump(result_to_data(self.__result), f, indent=4)


class ResultContext:
    def __init__(self, url_format: str, result_root: str):
        self.__url_format = url_format
        self.__result_root = result_root

    def _allocate_id(self):
        return str(uuid.uuid4())

    def _get_result_path(self, id: str):
        id = str(uuid.UUID(id))
        return os.path.join(self.__result_root, f"{id}.json")

    def allocate_result(self):
        id = self._allocate_id()
        url = self.__url_format.format(id=id)
        path = self._get_result_path(id)
        return DeferredResultControl(
            path=path,
            id=id,
            url=url
        )

    def get_result(self, id: str):
        try:
            with open(self._get_result_path(id), "r") as f:
                data = json.load(f)
                return result_data_from_data(data)
        except (FileNotFoundError, ValueError):
            return None
