from pydantic import BaseModel
from typing import Generic, TypeVar


ConfigT = TypeVar("ConfigT")

TypeT = TypeVar("TypeT")


class Job(BaseModel, Generic[TypeT, ConfigT]):
    id: str
    type: TypeT
    timestamp: float
    config: ConfigT
    target: str
