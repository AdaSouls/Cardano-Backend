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
        [Op.contains]: [ userId ]
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

/**
 * Add a soulbound to a collection.
 *
 * @param {string} collectionId
 * @returns {Array} soulbound
 */
const addCollectionSoulbound = async (params, body) => {

  let { collectionId } = params;
  let { name, beneficiary, metadata, signers } = body;

  let collection = await models.Collection.findOne({ where: { collectionId }});
  if (!collection) {
    console.log(`...error cannot find collection: ${collectionId}!`);
    errorService.stashBadRequest('Soulbound not created', 'not-created');
    return false;
  }

  // Add possible missing signers
  for (const stake of collection.invited) {
    if (signers.findIndex(s => s.stake == stake) < 0) {
      signers.push({
        stake,
        signature: ''
      })
    }
  }

  const soulboundPayload = {
    collectionId,
    name,
    beneficiary,
    metadata,
    mintUtxo: body.mintUtxo || null,
    claimUtxo: null,
    burnTx: null,
    signers,
  };

  let newSoulbound = await models.Soulbound.create(soulboundPayload);

  if (!newSoulbound) {
    console.log('...error creating new soulbound!');
    errorService.stashBadRequest('Soulbound not created', 'not-created');
    return false;
  }

  return newSoulbound;
}

/**
 * Update a soulbound.
 *
 * @param {string} soulboundId
 * @returns {Array} soulbound
 */
const updateCollectionSoulbound = async (params, body) => {

  let { soulboundId, collectionId } = params;
  let { mintUtxo, signers } = body;

  let soulbound = await models.Soulbound.findOne({ where: { soulboundId, collectionId }});
  if (!soulbound) {
    console.log(`...error cannot find soulbound: ${soulboundId}!`);
    errorService.stashBadRequest('Soulbound not updated', 'not-updated');
    return false;
  }

  soulbound.mintUtxo = mintUtxo;
  for (const {stake, signature} of signers) {
    const index = soulbound.signers.findIndex(s => s.stake == stake);
    soulbound.signers[index].signature = signature;
  }

  const updatedSoulbound = await soulbound.save();

  if (!updatedSoulbound) {
    console.log(`...error updating soulbound!`);
    errorService.stashBadRequest('Soulbound not updated', 'not-updated');
    return false;
  }

  return updatedSoulbound;
}

/**
 * Get all collection's soulbounds.
 *
 * @param {string} collectionId
 * @returns {Array} collections
 */
const getCollectionSoulbounds = async (collectionId) => {
  let collections = await models.Soulbound.findAll({ where: { collectionId } });
  return collections;
};



module.exports = {
  getAllUserCollections,
  getAllUserInvitedCollections,
  signCollection,
  addUserCollection,
  addCollectionSoulbound,
  updateCollectionSoulbound,
  getCollectionSoulbounds
};
