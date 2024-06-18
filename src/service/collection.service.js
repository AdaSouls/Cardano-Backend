const { Op } = require('sequelize');
const models = require('../model');
const errorService = require("./error.service");

/**
 * Get all soulbound collections created by a user.
 *
 * @param {string} userId
 * @returns {Array} collections
 */
const getAllUserCollections = async (userId) => {
  let collections = await models.Collection.findAll({ where: { owner: userId }});
  return collections;
};

/**
 * Get all soulbound collections a user has been invited to.
 *
 * @param {string} userId
 * @returns {Array} collections
 */
const getAllUserInvitedCollections = async (userId) => {
  let collections = await models.Collection.findAll({
    where: {
      invited: {
        [Op.contains]: [ { stake: userId }]
      }
    }
  });
  return collections;
};

/**
 * Sign a soulbound collection that a user has been invited to.
 *
 * @param {string} collectionId
 * @param {string} userId
 * @returns {Array} collections
 */
const signCollection = async (collectionId, userId) => {
  let collection = await models.Collection.findOne({ where: { collectionId: collectionId } });
  if (!collection) {
    console.log("Collection does not exist");
  }
  for (let index = 0; index < collection.dataValues.invited.length; index++) {
    if (collection.dataValues.invited[index].stake === userId) {
      collection.dataValues.invited[index].signed = true;
      collection.changed("invited", true);
      await collection.save();
    }
  }
  return collection;
};

/**
 * Add a soulbound collection to a user.
 *
 * @param {string} userId
 * @returns {Array} collections
 */
const addUserCollection = async (params, body) => {

  let { userId } = params;
  let { name, smartContract, policyId, policyHash, policy, mint, redeem, invited } = body;

  // Iterate invited array and create entry for database
  let invites = [];
  for (let index = 0; index < invited.length; index++) {
    const stake = invited[index];
    invites.push({
      stake,
      signed: false
    })
  }

  const collectionPayload = {
    owner: userId,
    name,
    smartContract,
    policyId,
    policyHash,
    policy,
    mint,
    redeem,
    invited: invites,
  };

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
  getAllUserInvitedCollections,
  signCollection,
  addUserCollection,
};
