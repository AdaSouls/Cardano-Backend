const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../util/pick');
const ApiError = require('../util/ApiError');

const validate = (schema, allowUnknown = true) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({
      allowUnknown,
      errors: {
        label: 'key',
      },
      abortEarly: false,
    })
    .validate(object)
  ;

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  Object.assign(req, value);

  return next();
};

module.exports = validate;
