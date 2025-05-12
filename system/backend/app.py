from flask import (
    Flask,
    jsonify,
    send_file,
    request,
)
import os
import logging
from flask_compress import Compress  # type: ignore
from dataclasses import asdict
from adapters.plp_adapter import adapter


current_adapter = adapter


def parse_query(args: dict[str, str]):
    return {
        key: str(value)
        for (key, value) in args.items()
    }


def create_app():
    logger = logging.getLogger(__name__)
    logger.info(f"Creating app: {current_adapter.name}")

    app = Flask(
        __name__,
        static_url_path="",
        static_folder="static"
    )
    app.secret_key = os.getenv("APP_SECRET_KEY", os.urandom(24).hex())
    Compress(app)

    @app.route('/api')
    def root():
        return jsonify(current_adapter.info)

    @app.route(f'/api/{current_adapter.name}')
    def service():
        data = parse_query(request.args)
        result = current_adapter.run(data)

        return (
            jsonify([asdict(r) for r in result])
            if isinstance(result, list)
            else jsonify(asdict(result))
        )

    @app.route('/config.json')
    def config():
        return jsonify({
            "rootUrl": f"/api/{current_adapter.name}",
            "id": "plp",
            "language": "en",
            "links": current_adapter.links,
            "translation": {
                "url": "/translation.json"
            },
            "fields": {
                "url": "/fields.json"
            },
            "layout": {
                "url": "/layout.json"
            }
        })

    @app.route('/translation.json')
    def translation():
        return jsonify(current_adapter.translation)

    @app.route('/fields.json')
    def fields():
        return jsonify(current_adapter.fields)

    @app.route('/layout.json')
    def layout():
        return jsonify(current_adapter.layout)

    @app.route('/')
    def index():
        return send_file(f"{app.static_folder}/index.html")

    @app.errorhandler(404)
    def http_404_error_handler(error):
        return send_file(f"{app.static_folder}/index.html")

    return app
