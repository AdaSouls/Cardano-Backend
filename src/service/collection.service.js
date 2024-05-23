const models = require('../model');
const errorService = require("./error.service");

/**
 * Get all soulbound collections created by a user.
 *
 * @param {string} userId
 * @returns {Array} collections
 */
const getAllUserCollections = async (userId) => {
  let collections = await models.Collection.findAll({ where: { userId: userId }});
  return collections;
};

/**
 * Add a soulbound collection to a user.
 *
 * @param {string} userId
 * @returns {Array} collections
 */
const addUserCollection = async (params, body) => {

  let { userId } = params;
  let { name, smartContract, policy } = body;

  const collectionPayload = {
    name,
    smartContract,
    policy,
    userId,
  };

  console.log(userId);

  let newCollection = await models.Collection.create(collectionPayload);

  if (!newCollection) {
    console.log('...error creating new soulbound collection!');
    errorService.stashBadRequest('Soulbound collection not created', 'not-created');
    return false;
  }

  return newCollection;
}

module.exports = {
  getAllUserCollections,
  addUserCollection,
};
