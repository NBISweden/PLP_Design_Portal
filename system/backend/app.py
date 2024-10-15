from flask import (
    Flask,
    jsonify,
    send_file,
    request,
)
import os
import logging
from flask_compress import Compress  # type: ignore


def parse_plp_query(args: dict[str, str]):
    return {
        key: str(value)
        for (key, value) in args.items()
    }


def create_app():
    logger = logging.getLogger(__name__)
    logger.info("Creating app")

    app = Flask(
        __name__,
        static_url_path="",
        static_folder="static"
    )
    app.secret_key = os.getenv("APP_SECRET_KEY", os.urandom(24).hex())
    Compress(app)

    @app.route('/api')
    def root():
        return jsonify({"message": "Hello from PLP Design Portal!"})

    @app.route('/api/plp_search')
    def plp_search():
        data = parse_plp_query(request.args)
        return jsonify({"data": data})
    
    @app.route('/config.json')
    def config():
        return jsonify({
            "rootUrl": f"{request.host_url}api/plp_search",
            "id": "plp",
            "language": "en",
        })

    @app.route('/')
    def index():
        return send_file(f"{app.static_folder}/index.html")

    return app
