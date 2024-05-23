const Joi = require('joi');

const { address, email } = require('./custom.validation');

const userLogin = {
  body: Joi.object().keys({
    email: Joi.string().optional().custom(email),
    username: Joi.string().optional(),
    sigData: Joi.object().required(),
  }),
};

const linkGame = {
  body: Joi.object().keys({
    otp: Joi.string().required(),
    userAuth: Joi.object().required(),
  }),
};

const linkExternalWallet = {
  body: Joi.object().keys({
    source: Joi.string().valid("mv").required(),
    appPublicKey: Joi.string().required(),
    externalWallet: Joi.object().keys({
      address: Joi.string().custom(address),
    }),
  }),
};

const unlinkExternalWallet = {
  body: Joi.object().keys({
    source: Joi.string().valid("mv").required(),
    appPublicKey: Joi.string().required(),
  }),
};

module.exports = {
  userLogin,
  linkGame,
  linkExternalWallet,
  unlinkExternalWallet,
};
