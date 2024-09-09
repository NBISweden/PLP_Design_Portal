#!/bin/bash

export HELP_TEXT="This is a management. It contains a number of \
utility functions that aims to simplify the process of development. \
The available actions are as follows:"
source scripts/core.sh

_setup_manage() {
	DOCKER="docker"
	COMPOSE="${DOCKER} compose"
	SCRIPTS="scripts"

	node() {
		${COMPOSE} run --rm frontend node "$@"
	}

	npm() {
		${COMPOSE} run --rm frontend npm "$@"
	}

	npx() {
		${COMPOSE} run --rm frontend npx "$@"
	}

	dev() {
		${COMPOSE} --profile dev "$@"
	}

	prod() {
		${COMPOSE} --profile prod "$@"
	}

	_add_action "node" "Runs command using node" "node [...node flags and args]"
	_add_action "npm" "Runs command using npm" "npm [...npm flags and args]"
	_add_action "npx" "Runs command using npx" "npx [...npx flags and args]"
	_add_action "dev" "Starts development environment" "dev [up|down|stop]"
	_add_action "prod" "Starts production like environment" "prod [up|down|stop]"
}

manage() {
	_setup_manage
	_run $@
}