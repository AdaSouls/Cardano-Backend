const Joi = require('joi');

const { email } = require('./custom.validation');

const userLogin = {
  body: Joi.object().keys({
    email: Joi.string().optional().custom(email),
    username: Joi.string().optional(),
    sigData: Joi.object().required(),
  }),
};

module.exports = {
  userLogin,
};
