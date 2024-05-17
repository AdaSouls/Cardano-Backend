#!/usr/bin/env bash

CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$CWD/vars.sh"


echo
echo "Bringing API down!!"
echo

echo -n "Down message: "
read MSG

echo -n "IP Whitelist (separate with commas): "
read WHITELIST

heroku config:set APP_STATE=0 APP_DOWN_MESSAGE="$MSG" APP_DOWN_IP_WHITELIST="$WHITELIST" --remote=$GIT_REMOTE
