#!/bin/sh
exec gunicorn -w "${APP_WORKERS:-4}" "app:create_app()" -b "0.0.0.0:${APP_PORT:-5000}"
