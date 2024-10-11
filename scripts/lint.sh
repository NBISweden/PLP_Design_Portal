#!/bin/bash

export HELP_TEXT="This is a support script that will help run linting."
source scripts/core.sh

_setup_lint() {
	DOCKER="docker"
	COMPOSE="${DOCKER} compose"
	SCRIPTS="scripts"

	backend() {
		PARSE_DIR="sed 's|/opt/app|./system/backend|g'"
		${COMPOSE} run --rm backend bash -c "flake8 /opt/app | ${PARSE_DIR}; mypy --show-absolute-path . | ${PARSE_DIR};"
	}

	frontend() {
		PARSE_DIR="sed 's|/opt/builder/src|./system/frontend/src|g'"
		${COMPOSE} run --rm frontend sh -c "npm run lint | ${PARSE_DIR}"
	}

	all() {
		backend
		frontend
	}

	_add_action "frontend" "Run linting on frontend code"
	_add_action "backend" "Run linting and type checking on backend code"
	_add_action "all" "Run all linting tasks"
}

lint() {
	_setup_lint
	_run $@
}