const Joi = require('joi');

const getUserCollections = {
  params: Joi.object().keys({
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
    policy: Joi.object().required(),
  }),
};

module.exports = {
  getUserCollections,
  addUserCollection,
};
