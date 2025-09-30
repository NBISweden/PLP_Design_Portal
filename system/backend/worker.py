from pydantic import TypeAdapter, ValidationError
from plp_directrna_design.cli_utils import (
    extract_features,
    extract_mrna,
    extract_sequences,
    find_targets,
    parse_genes,
    parse_iupac_mismatches,
)
from .adapters.result_data import (
    StatusData,
    StatusEntry,
    TableData,
)
from .adapters.result_manager import (
    ResultManager,
    ResultContext
)
from datetime import datetime
from .adapters.plp_adapter import PLPJob, PLPConfig, GenomeRepository
from typing import Generator
from .adapters.jobs import Job
import contextlib
import time
import os
import logging
import tempfile
import subprocess
from concurrent.futures import ProcessPoolExecutor


logger = logging.getLogger(__name__)


GENOME_LIST_PATH = os.getenv("PLP_GENOME_LIST_PATH", "genome_list.json")
JOBS_PATH = os.getenv("PLP_JOBS_PATH", "/tmp/jobs")
ACTIVE_JOBS_PATH = os.getenv("PLP_ACTIVE_JOBS_PATH", "/tmp/acive_jobs")
DEFERRED_RESULT_PATH = os.getenv("PLP_DEFERRED_RESULT_PATH", "/tmp/results")


job_adapter = TypeAdapter(PLPJob)


def job_sorting_key(entry):
    return entry.stat().st_mtime


def job_stream(jobs_path: str, polling_time=10) -> Generator[PLPJob, None, None]:
    black_list = set()
    while True:
        entries = sorted(
            [
                entry
                for entry in os.scandir(jobs_path)
                if entry.is_file() and entry.path not in black_list
            ],
            key=job_sorting_key
        )
        for current_job in entries:
            try:
                job = None
                with open(current_job.path, "r") as f:
                    job = job_adapter.validate_json(f.read())
                print(f"Stream: {job.id}")
                yield (job, current_job.path)
            except (OSError, ValidationError, IndexError):
                if current_job:
                    black_list.add(current_job.path)

        logger.info(f"Waiting to poll jobs: {polling_time}")
        time.sleep(polling_time)


@contextlib.contextmanager
def cwd_context(target_cwd: str):
    original_cwd = os.getcwd()
    os.chdir(target_cwd)

    try:
        yield

    finally:
        os.chdir(original_cwd)


class Runner:
    def __init__(self, genome_repository: GenomeRepository, max_workers=4):
        self._genome_repository = genome_repository
        self._executor = ProcessPoolExecutor(max_workers=4)

    def run(self, result_context: ResultContext, job: PLPJob):
        print(f"Submitting job: {job.id}")
        self._executor.submit(
            run_probe_design,
            self._genome_repository,
            result_context,
            job.config
        )


def run_probe_design(
    genome_repository: GenomeRepository,
    result_context: ResultContext,
    config: PLPConfig,
):
    status_entries: list[StatusEntry] = []
    genome_info = genome_repository.get(config.genome)
    src_fa_path = genome_repository.get_resource_path(genome_info.fa_path)
    src_indexed_fa_path = genome_repository.get_resource_path(genome_info.fai_path)
    src_gtf_path = genome_repository.get_resource_path(genome_info.gtf_path)

    def _update_status(status: StatusEntry):
        nonlocal status_entries
        status_entries = [
            *status_entries,
            status,
        ]
        logger.warning(f"{status.progress}: {status.description}")
        result_context.set_item(
            StatusData(
                label="PLP Result Status",
                id="plp-result",
                status=status_entries
            )
        )

    if not os.path.exists(src_indexed_fa_path):
        _update_status(
            StatusEntry(
                progress=0,
                description=f"Creating fasta index: {src_indexed_fa_path}"
            )
        )
        subprocess.run(["samtools", "faidx", src_fa_path])

    try:
        start_time = current_time()
        with tempfile.TemporaryDirectory(prefix="plp-workdir") as workdir:
            with cwd_context(workdir):
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"config: {config}"
                    )
                )
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"workdir: {workdir}"
                    )
                )

                fa_path = os.path.join(workdir, f"{os.path.basename(src_fa_path)}")
                os.symlink(src_fa_path, fa_path)
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"fa_path: {src_fa_path}, {fa_path}"
                    )
                )

                if os.path.isfile(src_indexed_fa_path):
                    indexed_fa_path = os.path.join(workdir, f"{os.path.basename(src_indexed_fa_path)}")
                    os.symlink(src_indexed_fa_path, indexed_fa_path)
                    _update_status(
                        StatusEntry(
                            progress=0,
                            description=f"indexed_fa_path: {src_indexed_fa_path}, {indexed_fa_path}"
                        )
                    )

                gtf_path = os.path.join(workdir, f"{os.path.basename(src_gtf_path)}")
                os.symlink(src_gtf_path, gtf_path)
                _update_status(
                    StatusEntry(
                        progress=0,
                        description=f"gtf_path: {src_gtf_path}, {gtf_path}"
                    )
                )

                extracted_features_output_path = os.path.join(workdir, "extracted_features.txt")
                transcriptome_output_path = os.path.join(workdir, "transcriptome.fa")
                extracted_sequences_fa_output_path = os.path.join(workdir, "extracted_sequences.fa")
                regions_output_path = os.path.join(workdir, "regions")
                result_output_path = os.path.join(workdir, "result.csv")

                _update_status(
                    StatusEntry(
                        progress=10,
                        description=f"extracted_features: {config.genes}"
                    )
                )

                extract_features(
                    gtf=gtf_path,
                    output=extracted_features_output_path,
                    genes=config.genes,
                    identifier_type=config.identifier_type,
                )
                _update_status(
                    StatusEntry(
                        progress=10,
                        description=f"extracted_features: {current_time() - start_time}"
                    )
                )

                extract_mrna(
                    gtf_file=gtf_path,
                    output_file=transcriptome_output_path,
                    fasta_file=fa_path,
                )
                _update_status(
                    StatusEntry(
                        progress=20,
                        description=f"extract_mrna: {current_time() - start_time}"
                    )
                )

                extract_sequences(
                    gtf_output=extracted_features_output_path,
                    fasta=fa_path,
                    output_fasta=extracted_sequences_fa_output_path,
                    plp_length=config.plp_length,
                    identifier_type=config.identifier_type,
                    regions_file=regions_output_path
                )
                _update_status(
                    StatusEntry(
                        progress=40,
                        description=f"extract_sequences: {current_time() - start_time}"
                    )
                )

                targets_df = find_targets(
                    selected_features=extracted_features_output_path,
                    sequences_output=extracted_sequences_fa_output_path,
                    output_file=result_output_path,
                    reference_fasta=extracted_sequences_fa_output_path,
                    min_coverage=config.min_coverage,
                    gc_min=config.gc_min,
                    gc_max=config.gc_max,
                    num_probes=config.number_of_probes,
                    iupac_mismatches=config.iupac_mismatches,
                    max_errors=config.max_errors,
                    check_specificity=config.check_probe_specificity,
                    plp_length=config.plp_length,
                    Tm_min=config.tm_min,
                    Tm_max=config.tm_max,
                    lowest_percentile_Tm_score_cutoff=config.lowest_percentile_tm_score_cutoff,
                    min_dist_probes=config.minimum_prope_distance,
                    filter_ligation_junction=config.filter_ligation_junction,
                    off_target_output=config.off_target_output
                )
                _update_status(
                    StatusEntry(
                        progress=100,
                        description=f"find_targets: {current_time() - start_time}"
                    )
                )

                headers = {
                    header: header
                    for header in targets_df.columns.values
                }
                entries = [entry for entry in targets_df.to_dict(orient="records")]
                result_context.set_item(
                    TableData(
                        id="plp-result",
                        label="PLP Result",
                        headers=headers,
                        entries=entries,
                    )
                )

    except Exception as e:
        _update_status(
            StatusEntry(
                progress=100,
                description=f"Search failed: {e}: {current_time() - start_time}"
            )
        )


def current_time():
    return datetime.now().timestamp()


def run(
    result_manager: ResultManager,
    runner: Runner,
    jobs_path: str,
    active_jobs_path: str,
    polling_time: int = 10
):
    os.makedirs(jobs_path, exist_ok=True)
    os.makedirs(active_jobs_path, exist_ok=True)
    for (job, job_path) in job_stream(jobs_path):
        context = result_manager.get_context(job.target)
        os.rename(job_path, os.path.join(active_jobs_path, job.id))
        logger.info(f"JOB: {job.id}")
        logger.info(job, job_path)
        runner.run(context, job)
        time.sleep(polling_time)


if __name__ == "__main__":
    run(
        result_manager=ResultManager(
            url_format="/api/deferred/{id}",
            result_root=DEFERRED_RESULT_PATH
        ),
        runner=Runner(
            genome_repository=GenomeRepository(GENOME_LIST_PATH)
        ),
        jobs_path=JOBS_PATH,
        active_jobs_path=ACTIVE_JOBS_PATH,
    )
