ARG FRONTEND_SRC_DIR=/opt/builder

########################################
FROM node:22-alpine3.19 AS dev
ARG FRONTEND_SRC_DIR

RUN mkdir -p "$FRONTEND_SRC_DIR"
WORKDIR "$FRONTEND_SRC_DIR"

CMD npm install ci && npm run build-watch
