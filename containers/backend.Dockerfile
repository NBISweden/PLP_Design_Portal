ARG FRONTEND_SRC_DIR=/opt/builder
ARG BACKEND_SRC_DIR=/opt/app
ARG UID=1000
ARG GID=1000


########################################
FROM python:3.9-slim AS base
ARG BACKEND_SRC_DIR
ARG UID
ARG GID

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
