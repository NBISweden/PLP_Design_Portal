ARG FRONTEND_SRC_DIR=/opt/builder
ARG BACKEND_SRC_DIR=/opt/app
ARG UID=1000
ARG GID=1000

# Clustal Args
ARG CLUSTAL_BUILD_DIR=/tmp/clustalw2-build
ARG CLUSTAL_NAME=clustalw-2.1


########################################
FROM ubuntu:22.04 AS clustal-builder
ARG CLUSTAL_BUILD_DIR
ARG CLUSTAL_NAME

# Adapted from https://bioinformaticsreview.com/20210126/how-to-install-clustalw2-on-ubuntu/
# Make sure we are up to date
RUN apt-get update -y
RUN apt-get upgrade -y

# Install build tools
RUN apt-get install -y build-essential
RUN apt-get install -y gpp g++ kcc fcc
RUN apt-get install -y curl

# Download and verify source files, NOTE: Is this source reliable enough?
RUN mkdir -p "$CLUSTAL_BUILD_DIR"
WORKDIR "$CLUSTAL_BUILD_DIR"

ARG CLUSTAL_URL=http://www.clustal.org/download/current/clustalw-2.1.tar.gz
ARG CLUSTAL_SHA256=e052059b87abfd8c9e695c280bfba86a65899138c82abccd5b00478a80f49486
RUN curl -o "$CLUSTAL_NAME.tar.gz" "$CLUSTAL_URL"
RUN echo "$CLUSTAL_SHA256 $CLUSTAL_NAME.tar.gz" | sha256sum --check --status
RUN tar xvzf "$CLUSTAL_NAME.tar.gz"

# Build clustal
WORKDIR "$CLUSTAL_BUILD_DIR/$CLUSTAL_NAME"
RUN ./configure
RUN make

########################################
FROM ubuntu:22.04 AS clustal
ARG CLUSTAL_BUILD_DIR
ARG CLUSTAL_NAME
ARG UID
ARG GID

RUN apt-get update -y
RUN apt-get install -y make g++

# Copy, install and clean up clustal
COPY --from=clustal-builder "$CLUSTAL_BUILD_DIR/$CLUSTAL_NAME" "$CLUSTAL_BUILD_DIR/$CLUSTAL_NAME"
WORKDIR "$CLUSTAL_BUILD_DIR/$CLUSTAL_NAME"
RUN make install
RUN rm -r "$CLUSTAL_BUILD_DIR"

########################################
FROM clustal AS base
ARG BACKEND_SRC_DIR
ARG UID
ARG GID

# Set python defaults
RUN apt-get install -y python-is-python3 python3-pip

# Prepare environment
RUN mkdir -p "$BACKEND_SRC_DIR"
WORKDIR "$BACKEND_SRC_DIR"
RUN mkdir -p static/

COPY backend/requirements.txt requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

RUN groupadd -g "$GID" python && useradd -u "$UID" -g "$GID" python

EXPOSE ${APP_PORT:-5000}/tcp

########################################
FROM base AS dev

COPY backend/requirements.dev.txt requirements.dev.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.dev.txt

USER python
CMD flask --app app.py --debug run --host 0.0.0.0 --port "${APP_PORT:-5000}"

########################################
FROM node:22-alpine3.19 AS builder
ARG FRONTEND_SRC_DIR

RUN mkdir -p "$FRONTEND_SRC_DIR"
WORKDIR "$FRONTEND_SRC_DIR"

COPY ./frontend/ "$FRONTEND_SRC_DIR/"

RUN npm install ci
RUN npm run build

########################################
FROM base AS prod
ARG FRONTEND_SRC_DIR

COPY backend/ ./
RUN chmod +x start-script.sh
COPY --from=builder "$FRONTEND_SRC_DIR/dist/" static/

USER python
CMD ./start-script.sh
