const { formalDbMigrations, basicDbSync } = require('./database/migrator');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;


/*
|--------------------------------------------------------------------------
| Error handling.
|--------------------------------------------------------------------------
*/

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});



/*
|--------------------------------------------------------------------------
| Bootstrap. Migrations followed by basic db connection.
|--------------------------------------------------------------------------
*/

basicDbSync().then(() => {
  formalDbMigrations().then(() => {
    logger.info('Fully Connected to PostgreSQL');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  }).catch((e) => {
    exitHandler();
  });
}).catch((e) => {
  exitHandler();
});
