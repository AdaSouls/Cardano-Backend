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

module.exports = {
  getUserCollections,
  getUserInvitedCollections,
  signCollection,
  addUserCollection,
};
