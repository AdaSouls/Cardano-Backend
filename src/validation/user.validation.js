const Joi = require('joi');

const { address, email } = require('./custom.validation');

const verifyAccount = {
  body: Joi.object().keys({
    walletAddress: Joi.string().custom(address),
    appPublicKey: Joi.string().optional().allow(null),
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

const linkGameWallet = {
  body: Joi.object().keys({
    gameWallet: Joi.object().keys({
      address: Joi.string().custom(address),
    }),
  }),
};

const generateCustomJwt = {
  body: Joi.object().keys({
    username: Joi.string().optional(),
    name: Joi.string().optional(),
    surname: Joi.string().optional(),
    email: Joi.string().optional().custom(email),
    sub: Joi.string().required(),
  }),
};

const generateMocaverseJwt = {
  body: Joi.object().keys({
    partnerUserId: Joi.string().required(),
    username: Joi.string().optional(),
  }),
};

const redeemUserPoints = {
  body: Joi.object().keys({
    source: Joi.string().valid("mv").required(),
    appPublicKey: Joi.string().optional().allow(null),
    pointsToRedeem: Joi.number().required(),
  }),
};

const getUserPoints = {
  body: Joi.object().keys({
    source: Joi.string().valid("mv").required(),
    appPublicKey: Joi.string().optional().allow(null),
  }),
};

const getUserStakes = {
  body: Joi.object().keys({
    source: Joi.string().valid("mv").required(),
    appPublicKey: Joi.string().optional().allow(null),
  }),
};

const getUserPointsHistory = {
  body: Joi.object().keys({
    source: Joi.string().valid("mv").required(),
    appPublicKey: Joi.string().optional().allow(null),
  }),
};

module.exports = {
  verifyAccount,
  linkGame,
  linkExternalWallet,
  unlinkExternalWallet,
  linkGameWallet,
  generateCustomJwt,
  generateMocaverseJwt,
  redeemUserPoints,
  getUserPoints,
  getUserStakes,
  getUserPointsHistory,
};
