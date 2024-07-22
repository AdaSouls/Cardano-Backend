#!/usr/bin/env bash

CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$CWD/vars.sh"


#############################################################
# a reference list of the vars we want to set
#

declare -A cfgVars

cfgVars=(
  [NPM_CONFIG_PRODUCTION]=false
  [HOST]=0.0.0.0
  [NODE_ENV]=$NODE_ENV
  [APP_STATE]=1
  [APP_DOWN_MESSAGE]=
  [DB_MIGRATION]=all
  [DB_SYNC]=all
  [ERROR_ALWAYS_STACK_TRACE]=0
  [RATE_LIMITING]=0
  [RATE_LIMITER_MAX_LIMIT_IP]=10
  [RATE_LIMITER_WINDOWS_MS]=900000
  [POSTGRESQL_SCHEMA]=public
  [POSTGRESQL_URL]=postgres://postgres:XM7f2p6JKJHH8PlDB4b1@motorverse-dev.cx6c2sy4amvm.eu-north-1.rds.amazonaws.com/adasouls
  [LOG_FILE]=log.txt
  [CODE_MASTER]="2UzARDri17Gvf5JeItsaK2dizPtSm1Q87CZxTiWJkcU8eUf7WVElN6=="
  [REDIS_SOURCE]=heroku
  [REDIS_TTL]=3600
  [FRONTEND_URL]="http://localhost:3000"
  [BLOCKFROST_API_KEY]="preprodHQwbvKLU7GHTmZfMifLlk9NBMq3JTDKV"
)


# build a command line so we can do it all in one cli call

cfgCmdline=""

for i in ${!cfgVars[@]}; do
  cfgCmdline="$cfgCmdline '$i=${cfgVars[$i]}' "
done

eval heroku config:set $cfgCmdline --remote=$GIT_REMOTE

