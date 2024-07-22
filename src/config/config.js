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
  web3: {
    blockfrost: {
      apiKey: envVars.BLOCKFROST_API_KEY,
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
};
