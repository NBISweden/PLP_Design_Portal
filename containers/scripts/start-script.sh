#!/bin/sh -

set -u

export XDG_CONFIG_HOME="/tmp/caddy/config"
export XDG_DATA_HOME="/tmp/caddy/data"

# Create the above directories if they don't exist.
install -d "$XDG_CONFIG_HOME"
install -d "$XDG_DATA_HOME"

SCRIPTDIR=`dirname "$0"`
caddy start --config "$SCRIPTDIR/Caddyfile"
python -m backend.worker &
exec gunicorn -w "${APP_WORKERS:-4}" "backend.app:create_app()" -b "0.0.0.0:${APP_PORT:-5000}"
