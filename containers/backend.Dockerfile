ARG FRONTEND_SRC_DIR=/opt/builder
ARG BACKEND_SRC_DIR=/opt/app
ARG BACKEND_SERVICE_DIR=/opt/app_service
ARG BACKEND_SERVICE_NAME=PLP_directRNA_design_V2
ARG BACKEND_PLP_GENOME_DATA_PATH=/home/plp_data
ARG UID=1000
ARG GID=1000


########################################
FROM ubuntu:24.10 AS service_base
ARG BACKEND_SERVICE_DIR
ARG BACKEND_PLP_GENOME_DATA_PATH
ENV PLP_GENOME_LIST_PATH="$BACKEND_PLP_GENOME_DATA_PATH/genome_list.json"

# Set environment variables to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system and bioinformatics build dependencies
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    make \
    gcc \
    g++ \
    python3 \
    python3-pip \
    build-essential \
    software-properties-common \
    automake \
    autoconf \
    perl \
    m4 \
    file \
    zlib1g-dev \
    libbz2-dev \
    liblzma-dev \
    libcurl4-gnutls-dev \
    libssl-dev \
    libncurses5-dev \
    libdeflate-dev \
    bedtools \
    && apt-get clean

# Download, build, and install samtools from source
RUN wget https://github.com/samtools/samtools/releases/download/1.21/samtools-1.21.tar.bz2 \
    && tar -xjf samtools-1.21.tar.bz2 \
    && rm samtools-1.21.tar.bz2 \
    && cd samtools-1.21 \
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


########################################
FROM service_base AS base
ARG BACKEND_SRC_DIR
ARG UID
ARG GID

RUN mkdir -p "$BACKEND_SRC_DIR"
WORKDIR "$BACKEND_SRC_DIR"
RUN mkdir -p static/

COPY --from=system backend/requirements.txt requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --break-system-packages -r requirements.txt

RUN getent group "$GID" || ( groupadd -g "$GID" python && useradd -u "$UID" -g "$GID" python )

EXPOSE ${APP_PORT:-5000}/tcp

########################################
FROM base AS dev

COPY --from=system backend/requirements.dev.txt requirements.dev.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --break-system-packages -r requirements.dev.txt

WORKDIR "$BACKEND_SRC_DIR"
USER "$GID"
CMD flask --app app.py --debug run --host 0.0.0.0 --port "${APP_PORT:-5000}"

########################################
FROM node:22-alpine3.19 AS builder
ARG FRONTEND_SRC_DIR

RUN mkdir -p "$FRONTEND_SRC_DIR"
WORKDIR "$FRONTEND_SRC_DIR"

COPY --from=system frontend/ "$FRONTEND_SRC_DIR/"

RUN npm install ci
RUN npm run build

########################################
FROM base AS prod
ARG UID
ARG FRONTEND_SRC_DIR
ARG BACKEND_PLP_GENOME_DATA_PATH

COPY --from=system backend/ ./
RUN chmod +x start-script.sh
COPY --from=builder "$FRONTEND_SRC_DIR/dist/" static/
RUN mkdir -p "$BACKEND_PLP_GENOME_DATA_PATH"
RUN chmod o+r "$BACKEND_PLP_GENOME_DATA_PATH"

USER "$UID"
CMD ./start-script.sh
