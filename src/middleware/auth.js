const httpStatus = require('http-status');
const ApiError = require('../util/ApiError');

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
};

module.exports = checkAuthenticated;
