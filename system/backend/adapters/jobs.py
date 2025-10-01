from pydantic import BaseModel, TypeAdapter, ValidationError
from typing import Generic, TypeVar, Type
from typing import Generator
import time
import os


ConfigT = TypeVar("ConfigT")

TypeT = TypeVar("TypeT")


class Job(BaseModel, Generic[TypeT, ConfigT]):
    id: str
    type: TypeT
    timestamp: float
    config: ConfigT
    target: str


class JobQueue:
    def __init__(self, job_type: Type, jobs_path: str, jobs_done_path: str):
        self.type_adapter = TypeAdapter(job_type)
        self.jobs_path = jobs_path
        self.jobs_done_path = jobs_done_path

    def get_jobs(self):
        job_entries = sorted(
            [
                entry
                for entry in os.scandir(self.jobs_path)
                if entry.is_file() and entry.path
            ],
            key=JobQueue.job_sorting_key
        )
        for job_entry in job_entries:
            try:
                job = self._read_entry(job_entry.path)
                yield job
            except (OSError, ValidationError):
                pass

    def job_stream(self, polling_time: float = 4) -> Generator[Job]:
        handled_jobs = set()
        while True:
            for job in self.get_jobs():
                if job.id not in handled_jobs:
                    print(f"Stream: {job.id}")
                    yield job
                    handled_jobs.add(job.id)
            time.sleep(polling_time)

    def submit_job(self, job: Job):
        with open(self._get_job_path(job), "w") as f:
            f.write(job.model_dump_json())

    def finish_job(self, job: Job):
        job_done_path = os.path.join(self.jobs_done_path, job.id)
        os.rename(self._get_job_path(job), job_done_path)

    def _get_job_path(self, job: Job):
        return os.path.join(self.jobs_path, job.id)

    def _read_entry(self, entry_path: str):
        with open(entry_path, "r") as f:
            return self.type_adapter.validate_json(f.read())

    @staticmethod
    def job_sorting_key(entry):
        return entry.stat().st_mtime

    @staticmethod
    def create_with_directories(
        job_type: Type,
        jobs_path: str,
        jobs_done_path: str
    ):
        os.makedirs(jobs_path, exist_ok=True)
        os.makedirs(jobs_done_path, exist_ok=True)
        return JobQueue(
            job_type=job_type,
            jobs_path=jobs_path,
            jobs_done_path=jobs_done_path
        )
