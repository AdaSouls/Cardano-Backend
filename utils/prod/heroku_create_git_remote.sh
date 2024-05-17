#!/usr/bin/env bash

CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$CWD/vars.sh"

heroku git:remote --remote=$GIT_REMOTE -a $HEROKU_APP_NAME
