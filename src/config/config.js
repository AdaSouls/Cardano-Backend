const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    HOST: Joi.string(),
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string().valid('production', 'staging', 'development', 'dev', 'beta', 'local', 'test').required(),
  })
  .unknown()
;

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  frontendUrl: envVars.FRONTEND_URL,
  frontendUrl2: envVars.FRONTEND_URL_2,
  db: {
    migrations: envVars.DB_MIGRATION || 'pending',
    sync: envVars.DB_SYNC || 'none',
  },
  errorHandling: {
    alwaysStackTrace: envVars.ERROR_ALWAYS_STACK_TRACE == 1,
  },
  appState: {
    down: envVars.APP_STATE != 1,
    downMsg: envVars.APP_DOWN_MESSAGE,
  },
  postgresql: {
    user: envVars.POSTGRESQL_USER,
    host: envVars.POSTGRESQL_HOST,
    database: envVars.POSTGRESQL_DB_NAME,
    password: envVars.POSTGRESQL_PASSWORD,
    port: envVars.POSTGRESQL_PORT,
    schema: envVars.POSTGRESQL_SCHEMA,
    url: envVars.POSTGRESQL_URL,
  },
  logger: {
    file: envVars.LOG_FILE,
  },
  walletContentMethod: envVars.WALLET_CONTENT_METHOD,
  web3: {
    supportedChains: envVars.SUPPORTED_CHAINS.split(', '),
    networkRpcUrls: envVars.NETWORK_RPC_URLS.split(', '),
    alchemy: {
      apiKeys: envVars.ALCHEMY_API_KEYS.split(', '),
      maxContractsPerCall: parseInt(envVars.ALCHEMY_MAX_CONTRACTS_PER_CALL),
    },
  },
  redis: {
    // we favour TLS connections - sometimes the Heroku addon only
    // sets REDIS_URL, but it's the rediss:// tls endpoint?!??
    endpoint: envVars.REDIS_TLS_URL || envVars.REDIS_URL,
    source: envVars.REDIS_SOURCE,
    ttl: envVars.REDIS_TTL,
  },
  functionCodes: {
    master: envVars.CODE_MASTER,
  },
  tmAnalyticsApi: {
    baseUrl: envVars.TM_ANALYTICS_API_BASE_URL,
    functionCodes: {
      master: envVars.TM_ANALYTICS_API_CODE_MASTER,
    },
  },
  b2c: {
    tenantId: envVars.B2C_TENANT_ID,
    tenantName: envVars.B2C_TENANT_NAME,
    tenantDirId: envVars.B2C_TENANT_DIR_ID,
  },
  web3auth: {
    jwksUrl: envVars.WEB3AUTH_JWKS_URL,
    walletJwksUrl: envVars.WEB3AUTH_WALLET_JWKS_URL,
  },
  otp: {
    expiration: envVars.OTP_EXPIRATION,
  },
  jwt: {
    customSecret: envVars.CUSTOM_JWT_SECRET,
  },
  moca: {
    partnerId: envVars.MOCA_PARTNER_ID,
    password: envVars.MOCA_PASSWORD,
  },
  points: {
    staking: {
      ethereum: {
        contractAddress: envVars.ETHEREUM_STAKING_SMART_CONTRACT,
      },
      polygon: {
        contractAddress: envVars.POLYGON_STAKING_SMART_CONTRACT,
      },
      confirmations: envVars.STAKING_BLOCK_CONFIRMATIONS,
      depositedEvent: envVars.STAKING_DEPOSITED_EVENT,
      withdrawnEvent: envVars.STAKING_WITHDRAWN_EVENT,
      amount: envVars.STAKING_POINTS,
    },
    tier: {
      bronze: envVars.BRONZE_TIER_THRESHOLD,
      silver: envVars.SILVER_TIER_THRESHOLD,
      gold: envVars.GOLD_TIER_THRESHOLD,
      platinum: envVars.PLATINUM_TIER_THRESHOLD,
    }
  }
};
