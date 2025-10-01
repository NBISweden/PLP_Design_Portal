from flask import (
    Flask,
    jsonify,
    request,
    make_response,
)
import os
import time
import logging
from flask_compress import Compress  # type: ignore
from .adapters.plp_adapter import create_adapter, get_job_type
from .adapters.result_manager import ResultManager
from .adapters.jobs import JobQueue


DEFERRED_RESULT_PATH = os.getenv("PLP_DEFERRED_RESULT_PATH", "/tmp/results")
JOBS_PATH = os.getenv("PLP_JOBS_PATH", "/tmp/jobs")
JOBS_DONE_PATH = os.getenv("PLP_JOBS_DONE_PATH", "/tmp/jobs_done")


def parse_query(args: dict[str, str]):
    return {
        key: [str(value) for v in value] if isinstance(value, list) else str(value)
        for (key, value) in args.items()
    }


def make_error(message):
    return make_response(jsonify({"error": message}), 404)


def create_app():
    wait_for_results_iterations = 1
    os.makedirs(DEFERRED_RESULT_PATH, exist_ok=True)
    deferred_url_format = "/api/deferred/{id}"
    result_manager = ResultManager(
        url_format=deferred_url_format,
        result_root=DEFERRED_RESULT_PATH
    )
    adapter = create_adapter()
    logger = logging.getLogger(__name__)
    logger.info(f"Creating app: {adapter.name}")
    job_queue = JobQueue.create_with_directories(
        job_type=get_job_type(),
        jobs_path=JOBS_PATH,
        jobs_done_path=JOBS_DONE_PATH
    )

    app = Flask(
        __name__,
    )
    app.secret_key = os.getenv("APP_SECRET_KEY", os.urandom(24).hex())
    Compress(app)

    @app.route('/api')
    def root():
        return jsonify(adapter.info)

    @app.route(f'/api/{adapter.name}')
    def service():
        data = parse_query(request.args)
        result = adapter.run(
            data=data,
            result_manager=result_manager,
            job_queue=job_queue
        )
        result_context = result_manager.get_context(id=result.id)
        for _i in range(wait_for_results_iterations):
            if hasattr(result, "refresh_rate"):
                time.sleep(result.refresh_rate / 1000)
                result = result_context.get_result()
            else:
                return jsonify(result.model_dump())

        return jsonify(result.model_dump())

    @app.route('/api/deferred/<result_id>')
    def deferred_result(result_id: str):
        try:
            if result_manager.has_context(id=result_id):
                result_context = result_manager.get_context(id=result_id)
                return jsonify(result_context.get_result().model_dump())
            else:
                logger.info("Failed to get result: Result context not found")
                return make_error(f"The result could not be found for: {result_id}")
        except ValueError as e:
            logger.info(f"Failed to get result: {e}")
            return make_error(f"The result could not be found for: {result_id}")

    @app.route('/api/queue/status')
    def queue_status():
        jobs_in_queue = [
            {
                "type": job.type,
                "startDate": job.date.isoformat(),
                "endDate": job.end_date.isoformat(),
                "resultUrl": deferred_url_format.format(id=job.target),
                "status": "in-queue",
            }
            for job in job_queue.get_jobs()
        ]
        jobs_finished = [
            {
                "type": job.type,
                "startDate": job.date.isoformat(),
                "endDate": job.end_date.isoformat(),
                "resultUrl": deferred_url_format.format(id=job.target),
                "status": "finished",
            }
            for job in job_queue.get_finished_jobs()
        ]
        return jsonify([
            *jobs_in_queue,
            *jobs_finished
        ])

    @app.route('/config/config.json')
    def config():
        return jsonify({
            "rootUrl": "/api/",
            "adapterUrl": f"/api/{adapter.name}",
            "resultUrl": "/api/deferred/",
            "id": "plp",
            "language": "en",
            "links": adapter.links,
            "translation": {
                "url": "/config/translation.json"
            },
            "fields": {
                "url": "/config/fields.json"
            },
            "layout": {
                "url": "/config/layout.json"
            },
        })

    @app.route('/config/translation.json')
    def translation():
        return jsonify(adapter.translation)

    @app.route('/config/fields.json')
    def fields():
        return jsonify(adapter.fields)

    @app.route('/config/layout.json')
    def layout():
        return jsonify(adapter.layout)

    return app
