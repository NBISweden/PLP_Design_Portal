from plp_directrna_design.cli_utils import (
    extract_features,
    extract_mrna,
    extract_sequences,
    find_targets,
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
from datetime import datetime, timedelta
from .adapters.plp_adapter import (
    PLPJob,
    PLPConfig,
    GenomeRepository
)
from .adapters.jobs import Job, JobQueue
import contextlib
import os
import logging
import tempfile
import subprocess
from concurrent.futures import ProcessPoolExecutor


logger = logging.getLogger(__name__)


GENOME_LIST_PATH = os.getenv("PLP_GENOME_LIST_PATH", "genome_list.json")
JOBS_PATH = os.getenv("PLP_JOBS_PATH", "/tmp/jobs")
JOBS_DONE_PATH = os.getenv("PLP_JOBS_DONE_PATH", "/tmp/jobs_done")
NUMBER_OF_WORKERS = os.getenv("PLP_NUMBER_OF_WORKERS", "1")
CLEAN_UP_PERIOD_SECONDS = os.getenv("PLP_CLEAN_UP_PERIOD_SECONDS", "3600")
DEFERRED_RESULT_PATH = os.getenv("PLP_DEFERRED_RESULT_PATH", "/tmp/results")


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
        self._executor = ProcessPoolExecutor(max_workers=max_workers)

    def run(self, result_context: ResultContext, job: PLPJob):
        logger.info(f"Submitting job: {job.id}")
        return self._executor.submit(
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

                targets_df, off_target_info = find_targets(
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
                    Tm_min=None if config.no_limit_tm else config.tm_min,
                    Tm_max=None if config.no_limit_tm else config.tm_max,
                    lowest_percentile_Tm_score_cutoff=None if config.no_limit_tm else config.lowest_percentile_tm_score_cutoff,
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

                result_context.set_item(
                    table_from_df(targets_df, "plp-result", "PLP Result")
                )

                if config.off_target_output and config.check_probe_specificity:
                    off_target_table = (
                        TableData(
                            id="plp-off-target-result",
                            label="No PLP Off Target Available",
                            headers={"value": "PLP Off Target Info"},
                            entries=[{"value": "No off target info available"}],
                        )
                        if off_target_info is None or off_target_info.empty
                        else table_from_df(off_target_info, "plp-off-target-result", "PLP Off Target Result")
                    )
                    result_context.set_item(off_target_table)

    except Exception as e:
        _update_status(
            StatusEntry(
                progress=100,
                description=f"Search failed: {e}: {current_time() - start_time}"
            )
        )
        raise e

def table_from_df(df, id:str, label:str) -> TableData:
    headers = {
        header: header
        for header in df.columns.values
    }
    entries = [entry for entry in df.to_dict(orient="records")]
    return TableData(
        id=id,
        label=label,
        headers=headers,
        entries=entries,
    )


def current_time():
    return datetime.now().timestamp()


def job_finisher(job_queue: JobQueue, job: Job):
    def _job_finisher(task):
        if task.done() and not task.cancelled() and not task.exception():
            job_queue.finish_job(job)

    return _job_finisher


def clean_up(job_queue: JobQueue, result_manager: ResultManager, min_end_date: datetime):
    logger.info("Cleaning up results", min_end_date)
    for job in job_queue.get_finished_jobs():
        if job.end_date < min_end_date:
            try:
                logger.info(f"Removing old result: {job.target}")
                result_manager.remove_context(job.target)
            except FileNotFoundError:
                pass

            try:
                logger.info(f"Removing old job: {job.id}")
                job_queue.remove_job(job)
            except FileNotFoundError:
                pass


def get_period_checker(period: timedelta):
    last_update = None

    def _period_checker():
        nonlocal last_update
        now = datetime.now()
        if last_update is None or now - last_update > period:
            last_update = now
            return True
        return False

    return _period_checker


def run(
    result_manager: ResultManager,
    runner: Runner,
    job_queue: JobQueue,
    clean_up_period: timedelta
):
    should_run_clean_up = get_period_checker(clean_up_period)
    for job in job_queue.job_stream():
        if should_run_clean_up():
            clean_up(job_queue, result_manager, datetime.now())

        logger.info(f"JOB: {job.id}")
        context = result_manager.get_context(job.target)
        future = runner.run(context, job)
        future.add_done_callback(job_finisher(job_queue, job))


if __name__ == "__main__":
    run(
        result_manager=ResultManager(
            url_format="/api/deferred/{id}",
            result_root=DEFERRED_RESULT_PATH
        ),
        runner=Runner(
            genome_repository=GenomeRepository(GENOME_LIST_PATH),
            max_workers=int(NUMBER_OF_WORKERS)
        ),
        job_queue=JobQueue.create_with_directories(
            job_type=PLPJob,
            jobs_path=JOBS_PATH,
            jobs_done_path=JOBS_DONE_PATH
        ),
        clean_up_period=timedelta(seconds=int(CLEAN_UP_PERIOD_SECONDS))
    )
