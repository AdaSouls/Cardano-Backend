#!/usr/bin/env bash

CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$CWD/vars.sh"


echo
echo "Bringing API up again!!"
echo

heroku config:set APP_STATE=1 --remote=$GIT_REMOTE
