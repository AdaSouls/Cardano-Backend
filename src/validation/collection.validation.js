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

const getCollection = {
  params: Joi.object().keys({
    collectionId: Joi.string().required(),
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
    invited: Joi.array().items(Joi.object()).optional(),
  }),
};

const updateUserCollection = {
  params: Joi.object().keys({
    collectionId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    smartContract: Joi.string().forbidden(),
    policyId: Joi.string().forbidden(),
    policyHash: Joi.string().forbidden(),
    policy: Joi.object().forbidden(),
    mint: Joi.object().forbidden(),
    redeem: Joi.object().forbidden(),
    invited: Joi.array().items(Joi.object()).forbidden(),
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
  }),
};

const updateCollectionSoulbound = {
  params: Joi.object().keys({
    collectionId: Joi.string().required(),
    soulboundId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    mintUtxo: Joi.object().optional(),
    claimUtxo: Joi.object().optional(),
    burnTx: Joi.string().optional(),
  }),
};

const getCollectionSoulbounds = {
  params: Joi.object().keys({
    collectionId: Joi.string().required(),
  }),
};

const getUserClaimableSoulbounds = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

module.exports = {
  getUserCollections,
  getUserInvitedCollections,
  signCollection,
  addUserCollection,
  updateUserCollection,
  getCollection,
  addCollectionSoulbound,
  updateCollectionSoulbound,
  getCollectionSoulbounds,
  getUserClaimableSoulbounds
};
