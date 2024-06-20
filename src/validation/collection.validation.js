const Joi = require('joi');

const getUserCollections = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const getUserInvitedCollections = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const signCollection = {
  params: Joi.object().keys({
    collectionId: Joi.string().guid().required(),
    userId: Joi.string().required(),
  }),
};

const addUserCollection = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    smartContract: Joi.string().required(),
    policyId: Joi.string().required(),
    policyHash: Joi.string().required(),
    policy: Joi.object().required(),
    mint: Joi.object().required(),
    redeem: Joi.object().required(),
    invited: Joi.array().items(Joi.string()).optional(),
  }),
};

const addCollectionSoulbound = {
  params: Joi.object().keys({
    collectionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    beneficiary: Joi.string().required(),
    metadata: Joi.object().required(),
    signers: Joi.array().items(Joi.object()).required(),
  }),
};

const updateCollectionSoulbound = {
  params: Joi.object().keys({
    collectionId: Joi.string().required(),
    soulboundId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    mintUtxo: Joi.object().required(),
    signers: Joi.array().items(Joi.object()).required(),
  }),
};

const getCollectionSoulbounds = {
  params: Joi.object().keys({
    collectionId: Joi.string().required(),
  }),
};

module.exports = {
  getUserCollections,
  getUserInvitedCollections,
  signCollection,
  addUserCollection,
  addCollectionSoulbound,
  updateCollectionSoulbound,
  getCollectionSoulbounds
};
