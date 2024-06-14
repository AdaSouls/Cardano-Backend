const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieSession = require("cookie-session");
const xss = require('xss-clean');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const routesV1 = require('./route/v1');
const argv = require('minimist')(process.argv.slice(2));
const { errorConverter, errorHandler } = require('./middleware/error');
const checkDown = require('./middleware/down');
const ApiError = require('./util/ApiError');

const app = express();
const subpath = express();

// morgan logger
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// req.session
app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: [config.jwt.sessionSecret],
    httpOnly: true,
    sameSite: "strict",
  })
);

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
if (config.frontendUrl2) {
  app.use(
    cors({
      credentials: true,
      origin: [config.frontendUrl, config.frontendUrl2 || ''],
    })
  );
} else {
  app.use(cors({ credentials: true, origin: config.frontendUrl }));
}
app.options('*', cors());

// see "Troubleshooting Proxy" section here https://www.npmjs.com/package/express-rate-limit
app.set('trust proxy', 2);
app.get('/ip45v', (request, response) => response.send({ ip: request.ip, trustLevel: 2 })); // a helper route to calc the correct value for "trust proxy"

// check if app is currently down
app.use(checkDown);

// v1 api routes
app.use('/api/v1', routesV1);

// v1 swagger
app.use('/swagger/v1', subpath);

const swagger = require('swagger-node-express').createNew(subpath);

app.use(express.static('dist'));

swagger.setApiInfo({
  title: "Cardano Backend API",
  description: "AdaSouls implementation of a Node.js Server + Postgres that interacts with Cardano Blockchain",
  termsOfServiceUrl: "",
  contact: "matias.falcone@gmail.com",
  license: "",
  licenseUrl: ""
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

// Set api-doc path
swagger.configureSwaggerPaths('', 'api-docs', '');

// Configure the API domain
var domain = 'localhost';
if(argv.domain !== undefined)
  domain = argv.domain;
else
  console.log('No --domain=xxx specified, taking default hostname "localhost".')

// Configure the API port
var port = 9999;
if(argv.port !== undefined)
  port = argv.port;
else
  console.log('No --port=xxx specified, taking default port ' + port + '.')

// Set and display the application URL
var applicationUrl = 'http://' + domain + ':' + port;
console.log('snapJob API running on ' + applicationUrl);

swagger.setAppHandler(app);
swagger.configure(applicationUrl, '1.0.0');
app.listen(port);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
