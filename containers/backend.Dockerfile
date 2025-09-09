ARG FRONTEND_SRC_DIR=/opt/builder
ARG BACKEND_SRC_DIR=/opt/app
ARG BACKEND_SCRIPTS=/opt/app_exec
ARG BACKEND_SERVICE_DIR=/opt/app_service
ARG BACKEND_SERVICE_NAME=PLP_directRNA_design_V2
ARG BACKEND_PLP_GENOME_DATA_PATH=/home/plp_data
ARG UID=1000
ARG GID=1000


########################################
FROM python:3.13-alpine3.22 AS service_base
ARG BACKEND_SERVICE_DIR
ARG BACKEND_PLP_GENOME_DATA_PATH
ENV PLP_GENOME_LIST_PATH="$BACKEND_PLP_GENOME_DATA_PATH/genome_list.json"

# Set environment variables to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system and bioinformatics build dependencies
RUN --mount=type=cache,target=/etc/apk/cache apk update \
    && apk add ca-certificates wget \
    && apk add --update --no-cache ncurses xz-libs  \
    && apk add --update --no-cache  \
    && apk add --virtual=build-deps --update --no-cache ncurses-dev musl-dev gcc g++ make build-base musl-dev zlib-dev autoconf bzip2-dev xz-dev

WORKDIR /tmp/samtools-build
RUN update-ca-certificates \
    && wget https://github.com/samtools/samtools/releases/download/1.21/samtools-1.21.tar.bz2 \
    && tar -xjf samtools-1.21.tar.bz2 \
    && rm samtools-1.21.tar.bz2 

RUN cd samtools-1.21 \
    && autoheader \
    && autoconf -Wno-syntax \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf samtools-1.21

# Install Python dependencies
COPY system/PLP_directRNA_design_V2/requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy service code resources
RUN mkdir -p "$BACKEND_SERVICE_DIR"
WORKDIR "$BACKEND_SERVICE_DIR"
COPY --from=system PLP_directRNA_design_V2/codes codes
COPY --from=system PLP_directRNA_design_V2/PLP_directRNA_design_package PLP_directRNA_design_package

# Copy and install local Python package
WORKDIR "$BACKEND_SERVICE_DIR/PLP_directRNA_design_package"
RUN pip3 install --break-system-packages .

RUN apk del build-deps


########################################
FROM service_base AS base
ARG BACKEND_SRC_DIR
ARG UID
ARG GID

RUN mkdir -p "$BACKEND_SRC_DIR"
WORKDIR "$BACKEND_SRC_DIR"

COPY --from=system backend/requirements.txt requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --break-system-packages -r requirements.txt

RUN --mount=type=cache,target=/etc/apk/cache \
	apk add caddy

EXPOSE 8080/tcp

########################################
FROM base AS dev

RUN adduser -D -u "$UID" runner

COPY --from=system backend/requirements.dev.txt requirements.dev.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --break-system-packages -r requirements.dev.txt

COPY --chown=$UID --chmod=444 containers/caddy/Caddyfile.dev "$BACKEND_SCRIPTS/Caddyfile"
COPY --chown=$UID --chmod=555 containers/scripts/start-script.dev.sh "$BACKEND_SCRIPTS/start-script.sh"

WORKDIR "$BACKEND_SRC_DIR"

USER "$UID"
CMD "$BACKEND_SCRIPTS/start-script.sh"

########################################
FROM node:22-alpine3.19 AS builder
ARG FRONTEND_SRC_DIR

RUN mkdir -p "$FRONTEND_SRC_DIR"
WORKDIR "$FRONTEND_SRC_DIR"

COPY --from=system frontend/ "$FRONTEND_SRC_DIR/"

RUN npm ci
RUN npm run build

########################################
FROM base AS prod
ARG UID
ARG FRONTEND_SRC_DIR
ARG BACKEND_PLP_GENOME_DATA_PATH

COPY --from=system backend/ ./
COPY --from=builder "$FRONTEND_SRC_DIR/dist/" frontend/
RUN mkdir -p "$BACKEND_PLP_GENOME_DATA_PATH"
RUN chmod o+r "$BACKEND_PLP_GENOME_DATA_PATH"

COPY --chown=$UID --chmod=444 containers/caddy/Caddyfile "$BACKEND_SCRIPTS/Caddyfile"
COPY --chown=$UID --chmod=555 containers/scripts/start-script.sh "$BACKEND_SCRIPTS/start-script.sh"

USER "$UID"
CMD "$BACKEND_SCRIPTS/start-script.sh"
