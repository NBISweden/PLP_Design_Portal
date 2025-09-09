#!/bin/sh -

set -u

export XDG_CONFIG_HOME="/tmp/caddy/config"
export XDG_DATA_HOME="/tmp/caddy/data"

# Create the above directories if they don't exist.
install -d "$XDG_CONFIG_HOME"
install -d "$XDG_DATA_HOME"

SCRIPTDIR=`dirname "$0"`
caddy start --config "$SCRIPTDIR/Caddyfile"
exec flask --app app.py --debug run --host 0.0.0.0 --port 5000
