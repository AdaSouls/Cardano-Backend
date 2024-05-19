const Joi = require('joi');
const { address, chain, tokenType } = require('./custom.validation');

/*
|--------------------------------------------------------------------------
| NFT assets.
|--------------------------------------------------------------------------
*/

const getNftAssetByAddress = {
  params: {
    address: Joi.string().required().custom(address),
  },
};

const syncNftAsset = {
  body: Joi.object().keys({
    tokenType: Joi.string().custom(tokenType).required(),
    title: Joi.string().required(),
    chain: Joi.string().required().custom(chain),
    address: Joi.string().required().custom(address),
    internalContractId: Joi.number().optional().allow(null),
    startBlock: Joi.number().optional().allow(null),
    gameData: Joi.array().optional().allow(null).items(Joi.object().keys({
      tokenId: Joi.number().required(),
      assetId: Joi.string().required(),
    })),
  }),
};

const deleteNftAsset = {
  params: {
    address: Joi.string().required().custom(address),
  }
};

/*
|--------------------------------------------------------------------------
| Exports.
|--------------------------------------------------------------------------
*/

module.exports = {
  getNftAssetByAddress,
  syncNftAsset,
  deleteNftAsset,
};
