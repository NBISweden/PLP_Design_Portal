from flask import (
    Flask,
    jsonify,
    send_file,
    request,
    abort,
)
import os
import logging
from flask_compress import Compress  # type: ignore
from adapters.mock_adapter import create_adapter
from adapters.result_data import result_to_data
from adapters.result_context import ResultContext


def parse_query(args: dict[str, str]):
    return {
        key: str(value)
        for (key, value) in args.items()
    }


def create_app():
    result_context = ResultContext(
        url_format="/deferred/{id}",
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
        result = adapter.run(data, result_context)

        return (
            jsonify([result_to_data(r) for r in result])
            if isinstance(result, list)
            else jsonify(result)
        )

    @app.route('/deferred/<result_id>')
    def deferred_result(result_id: str):
        deferred_result = result_context.get_result(id=result_id)
        if deferred_result is None:
            abort(404)
        else:
            return jsonify(deferred_result)

    @app.route('/config.json')
    def config():
        return jsonify({
            "rootUrl": f"/api/{adapter.name}",
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
