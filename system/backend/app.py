from flask import (
    Flask,
    jsonify,
    send_file,
    request,
    make_response,
)
import os
import logging
from flask_compress import Compress  # type: ignore
from adapters.plp_adapter import create_adapter
from adapters.result_manager import ResultManager


def parse_query(args: dict[str, str]):
    return {
        key: str(value)
        for (key, value) in args.items()
    }


def make_error(message):
    return make_response(jsonify({"error": message}), 404)


def create_app():
    result_manager = ResultManager(
        url_format="/api/deferred/{id}",
        result_root="/tmp"
    )
    adapter = create_adapter()
    logger = logging.getLogger(__name__)
    logger.info(f"Creating app: {adapter.name}")

    app = Flask(
        __name__,
        static_url_path="",
        static_folder="static"
    )
    app.secret_key = os.getenv("APP_SECRET_KEY", os.urandom(24).hex())
    Compress(app)

    @app.route('/api')
    def root():
        return jsonify(adapter.info)

    @app.route(f'/api/{adapter.name}')
    def service():
        data = parse_query(request.args)
        result = adapter.run(data, result_manager)

        return jsonify(result.model_dump())

    @app.route('/api/deferred/<result_id>')
    def deferred_result(result_id: str):
        try:
            result_context = result_manager.get_context(id=result_id)
            if result_context is None:
                return make_error(f"The result could not be found for: {result_id}")
            else:
                return jsonify(result_context.get_result().model_dump())
        except ValueError:
            return make_error(f"The result could not be found for: {result_id}")

    @app.route('/config.json')
    def config():
        return jsonify({
            "rootUrl": "/api/",
            "adapterUrl": f"/api/{adapter.name}",
            "resultUrl": "/api/deferred/",
            "id": "plp",
            "language": "en",
            "links": adapter.links,
            "translation": {
                "url": "/translation.json"
            },
            "fields": {
                "url": "/fields.json"
            },
            "layout": {
                "url": "/layout.json"
            },
        })

    @app.route('/translation.json')
    def translation():
        return jsonify(adapter.translation)

    @app.route('/fields.json')
    def fields():
        return jsonify(adapter.fields)

    @app.route('/layout.json')
    def layout():
        return jsonify(adapter.layout)

    @app.route('/')
    def index():
        return send_file(f"{app.static_folder}/index.html")

    @app.errorhandler(404)
    def http_404_error_handler(error):
        return send_file(f"{app.static_folder}/index.html")

    return app
