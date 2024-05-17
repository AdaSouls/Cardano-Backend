#!/usr/bin/env bash

CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$CWD/vars.sh"

heroku create --remote=$GIT_REMOTE --buildpack=heroku/nodejs $HEROKU_APP_NAME
heroku git:remote --remote=$GIT_REMOTE --app=$HEROKU_APP_NAME

. "$CWD/heroku_set_all_config_vars.sh"
