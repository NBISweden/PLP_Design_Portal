from flask import (
    Flask,
    jsonify,
    send_file,
    request,
)
import os
import logging
from flask_compress import Compress  # type: ignore
from dataclasses import dataclass, asdict


def parse_plp_query(args: dict[str, str]):
    return {
        key: str(value)
        for (key, value) in args.items()
    }


@dataclass
class TableData:
    headers: dict[str, str]
    entries: list[dict[str, str]]
    type: str = "table"


@dataclass
class Result:
    id: str
    label: str
    content: TableData


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
        result = Result(
            id="plp-search",
            label="PLP Search",
            content=TableData(
                headers={
                    "value": "Value",
                    "param": "Param"
                },
                entries=[
                    {"param": param, "value": value}
                    for param, value in data.items()
                ]
            )
        )
        return jsonify([
            asdict(result)
        ])

    @app.route('/config.json')
    def config():
        return jsonify({
            "rootUrl": "/api/plp_search",
            "id": "plp",
            "language": "en",
            "links": [
                {
                    "id": "github",
                    "href": "https://github.com/NBISweden/PLP_Design_Portal",
                    "icon": "fa-brands fa-github",
                },
                {
                    "id": "nbis",
                    "href": "https://nbis.se",
                    "icon": "fa-brands fa-twitter",
                }
            ],
            "translation": {
                "url": "/translation.json"
            },
            "fields": {
                "url": "/fields.json"
            }
        })

    @app.route('/translation.json')
    def translation():
        return send_file("data/translation.json")

    @app.route('/fields.json')
    def fields():
        return send_file("data/fields.json")

    @app.route('/')
    def index():
        return send_file(f"{app.static_folder}/index.html")

    @app.errorhandler(404)
    def http_404_error_handler(error):
        return send_file(f"{app.static_folder}/index.html")

    return app
