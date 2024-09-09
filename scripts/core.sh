#!/bin/bash

HELP_TEXT=${HELP_TEXT:-"This is a management script."}

_setup_actions() {
    ACTIONS=()
    HELP_SECTIONS=()
    EXAMPLES=()

    help() {
        echo "$HELP_TEXT"
        local AC='\e[0;32m'
        local NC='\e[0m'
        for action_index in "${!ACTIONS[@]}"
        do
            echo -e "  - ${AC}${ACTIONS[$action_index]}${NC}: ${HELP_SECTIONS[$action_index]}"
            CURRENT_EXAMPLES=${EXAMPLES[$action_index]}
            for example_msg in "${CURRENT_EXAMPLES[@]}"
            do
                echo -e "    ${example_msg}"
            done
        done
    }

    _add_action() {
        # _add_action <action_id> <help_section> <example_command>
        ACTIONS+=("$1")
        HELP_SECTIONS+=("$2")
        SINGLE_EXAMPLE=("${@:3:99}")
        EXAMPLES+=("$SINGLE_EXAMPLE")
    }

    _run() {
        # _run <action_id> [...additional_params]
        local action="$1"
        local TC='\e[0;31m'
        local NC='\e[0m'
        if [ -n "$action" ] && grep -qF -w -e "$action" <<<"${ACTIONS[*]}"
        then
            echo -e "${TC}# Running: $action${NC}"
            "$action" "${@:2:99}"
        else
            echo -e "${TC}# Manage script${NC}"
            help
        fi
    }

    _require_distro() {
        local DISTRONAME=`cat /etc/*-release | grep -Po '^NAME="\K[^"]*'`
        if [ ! "$DISTRONAME" = "$1" ]; then
            echo "Warning: Incorrect distro name \"$DISTRONAME\". Expected \"$1\"";
            exit 1;
        fi
    }

    _add_action "help" "Display help message and a list of available commands"
}

_setup_actions
