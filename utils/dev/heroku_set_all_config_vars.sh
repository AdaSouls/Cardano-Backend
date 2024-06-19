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
  [OTP_EXPIRATION]=1
  [CUSTOM_JWT_SECRET]="cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
  [FRONTEND_URL]="http://localhost:3000"
  [SUPPORTED_CHAINS]="polygon:amoy, ethereum:sepolia"
  [NETWORK_RPC_URLS]="https://polygon-amoy.g.alchemy.com/v2/hzlkisWZjAHveyetlZlySggkeWf5U_xu, https://eth-sepolia.g.alchemy.com/v2/gSkDzX85fosCDnq3bswde7eDaM_7Q7w0"
  [ALCHEMY_API_KEYS]="hzlkisWZjAHveyetlZlySggkeWf5U_xu, gSkDzX85fosCDnq3bswde7eDaM_7Q7w0"
)


# build a command line so we can do it all in one cli call

cfgCmdline=""

for i in ${!cfgVars[@]}; do
  cfgCmdline="$cfgCmdline '$i=${cfgVars[$i]}' "
done

eval heroku config:set $cfgCmdline --remote=$GIT_REMOTE

