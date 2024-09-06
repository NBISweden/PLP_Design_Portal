ARG FRONTEND_SRC_DIR=/opt/builder
ARG UID=1000

########################################
FROM node:22-alpine3.19 AS dev
ARG FRONTEND_SRC_DIR
ARG UID

RUN mkdir -p "$FRONTEND_SRC_DIR"
WORKDIR "$FRONTEND_SRC_DIR"

USER "$UID"

CMD npm install ci && npm run dev
