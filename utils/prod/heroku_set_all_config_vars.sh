#!/usr/bin/env bash

CWD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$CWD/vars.sh"


#############################################################
# a reference list of the vars we want to set
#

declare -A cfgVars

cfgVars=(

  # standard ones for nodejs on heroku

  [NPM_CONFIG_PRODUCTION]=true
  [HOST]=0.0.0.0
  [NODE_ENV]=$NODE_ENV


  ##############################
  ## up/down management

  [APP_STATE]=1
  [APP_DOWN_MESSAGE]=

  ##############################
  ## db migration
  [DB_MIGRATION]=all
  [DB_SYNC]=all


  ##############################
  ## error handling
  [ERROR_ALWAYS_STACK_TRACE]=0

  ##############################
  ## rate limiting
  [RATE_LIMITING]=0
  [RATE_LIMITER_MAX_LIMIT_IP]=10
  [RATE_LIMITER_WINDOWS_MS]=900000


  ##############################
  ## postgresql
  [POSTGRESQL_SCHEMA]=public
  [POSTGRESQL_URL]=postgres://postgres:i-02c8592d677f02c99@51.21.80.182/motorverse


  ##############################
  ## logging
  [LOG_FILE]=log.txt


  ##############################
  ## function codes
  [CODE_MASTER]="xlAnuW3g6INIAhnCuuOweaaJ0t2ML21p7mcJIRcgT8xB4k0a8EHqTp=="


  ##############################
  ## TM Analytics API

  # production
  [TM_ANALYTICS_API_BASE_URL]="https://tm-analytics-api-prod-i3x6t2b.herokuapp.com/v1"
  [TM_ANALYTICS_API_CODE_MASTER]="Lu8MFAUIomMYYXXu7QeEvoVWWPSBv813g2mePgh2097KHKXJZ7L8D8=="


  ##############################
  ## redis
  [REDIS_SOURCE]=heroku
  [REDIS_TTL]=3600

  ## b2c
  [B2C_TENANT_ID]=tmuseracctsdev.onmicrosoft.com
  [B2C_TENANT_NAME]=tmuseracctsdev
  [B2C_TENANT_DIR_ID]=a03cd0f7-1503-4b54-b768-4ee5532b3ca6

  ## web3auth
  [WEB3AUTH_JWKS_URL]="https://api-auth.web3auth.io/jwks"
  [WEB3AUTH_WALLET_JWKS_URL]="https://authjs.web3auth.io/jwks"

  ## OTP
  [OTP_EXPIRATION]=1

  ## custom jwt
  [CUSTOM_JWT_SECRET]="cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"

  ## frontend
  [FRONTEND_URL]="https://motorverse.com"
  [FRONTEND_URL_2]="https://motorverse.freemyip.com"

  [SUPPORTED_CHAINS]="polygon:mainnet, ethereum:mainnet"

  [NETWORK_RPC_URLS]="https://polygon-mainnet.g.alchemy.com/v2/fXHGi0CFRYj2hqbwdDjR5Bti1as9WzFv, https://eth-mainnet.g.alchemy.com/v2/UxLwlWbSd-zxZKsg4VOFqfg-WOzlgQKT"

  [ALCHEMY_API_KEYS]="fXHGi0CFRYj2hqbwdDjR5Bti1as9WzFv, UxLwlWbSd-zxZKsg4VOFqfg-WOzlgQKT"

  [ALCHEMY_MAX_CONTRACTS_PER_CALL]=20

  [WALLET_CONTENT_METHOD]="alchemy"

  [MOCA_PARTNER_ID]="3f29be20-8eab-42b9-92e9-43b145956ab6"

  [MOCA_PASSWORD]="Mocaverse_2024"

  ## points system
  [STAKING_POINTS]=300
  [BRONZE_TIER_THRESHOLD]=500
  [SILVER_TIER_THRESHOLD]=2000
  [GOLD_TIER_THRESHOLD]=5000
  [PLATINUM_TIER_THRESHOLD]=10000
  [STAKING_BLOCK_CONFIRMATIONS]=3
  [ETHEREUM_STAKING_SMART_CONTRACT]=0xC3Fa7959FF00CF3B4E1159D3Be3c7176831532D3
  [POLYGON_STAKING_SMART_CONTRACT]=0xc1C6912c2557597d1F5E894Ec0D8806D80bf0553
  [STAKING_DEPOSITED_EVENT]=0x559852b840577bb951535d30f94176aa68963c7edc384c87921e88ca842841c8
  [STAKING_WITHDRAWN_EVENT]=0x4e0e6df8f0b7ca214fea78e176c02f9e7a0ac7ebce26efed914654280e1befab

)


# build a command line so we can do it all in one cli call

cfgCmdline=""

for i in ${!cfgVars[@]}; do
  cfgCmdline="$cfgCmdline '$i=${cfgVars[$i]}' "
done

eval heroku config:set $cfgCmdline --remote=$GIT_REMOTE
