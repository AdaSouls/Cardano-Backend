const Joi = require('joi');

const { address, email, walletType } = require('./custom.validation');
const { gameId, gameIdOrHub } = require('./game.validation');

const verifyAccount = {
  body: Joi.object().keys({
    source: Joi.string().required().custom(gameIdOrHub),
    walletAddress: Joi.string().custom(address),
    appPublicKey: Joi.string().optional().allow(null),
  }),
};

const generateOtp = {
  body: Joi.object().keys({
    gameId: Joi.string().required().custom(gameId),
  }),
};

const linkGame = {
  body: Joi.object().keys({
    gameId: Joi.string().required().custom(gameId),
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
      type: Joi.string().custom(walletType),
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
    source: Joi.string().required().custom(gameId),
    gameWallet: Joi.object().keys({
      address: Joi.string().custom(address),
      type: Joi.string().custom(walletType),
    }),
  }),
};

const unlinkGameWallet = {
  body: Joi.object().keys({
    source: Joi.string().required().custom(gameId),
  }),
};

const generateCustomJwt = {
  body: Joi.object().keys({
    gameId: Joi.string().required().custom(gameId),
    username: Joi.string().optional(),
    name: Joi.string().optional(),
    surname: Joi.string().optional(),
    email: Joi.string().optional().custom(email),
    sub: Joi.string().required(),
  }),
};

const generateMocaverseJwt = {
  body: Joi.object().keys({
    gameId: Joi.string().required().custom(gameId),
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
  generateOtp,
  linkGame,
  linkExternalWallet,
  unlinkExternalWallet,
  linkGameWallet,
  unlinkGameWallet,
  generateCustomJwt,
  generateMocaverseJwt,
  redeemUserPoints,
  getUserPoints,
  getUserStakes,
  getUserPointsHistory,
};
