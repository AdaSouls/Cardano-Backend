const { address } = require("./custom.validation");
const { gameId } = require("./game.validation");
const Joi = require("joi");

const getWalletContent = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    gameId: Joi.string().optional().custom(gameId),
    walletAddress: Joi.string().optional().allow(null).custom(address),
    smartWalletAddress: Joi.string().optional().allow(null).custom(address),
    forceRefresh: Joi.boolean().optional().default(false),
    method: Joi.string().optional().allow(null),
  }),
};

const markWallet = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    gameId: Joi.string().optional().custom(gameId).allow(null),
    walletAddress: Joi.string().optional().allow(null).custom(address),
  }),
};

module.exports = {
  getWalletContent,
  markWallet,
};
