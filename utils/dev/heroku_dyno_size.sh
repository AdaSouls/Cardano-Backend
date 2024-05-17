#!/usr/bin/env bash

CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$CWD/vars.sh"

heroku ps:resize web=basic --remote=$GIT_REMOTE --app=$HEROKU_APP_NAME
