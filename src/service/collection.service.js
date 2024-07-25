const { Op, Sequelize } = require('sequelize');
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
        [Op.contains]: Sequelize.literal(`'[{ "user": "${userId}" }]'::jsonb`)
      },
      owner: {
        [Op.not]: userId
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
const signCollection = async (collectionId, user, signature) => {
  let collection = await models.Collection.findOne({ where: { collectionId: collectionId } });
  if (!collection) {
    console.log("Collection does not exist");
    errorService.stashBadRequest('Soulbound collection not signed', 'not-signed');
    return false;
  }
  const index = collection.invited.findIndex(i => i.user == user && i.signature == "");
  if (index < 0) {
    console.log('...error signing soulbound collection!');
    errorService.stashBadRequest('Soulbound collection not signed', 'not-signed');
    return false;
  }
  const updatedInvited = collection.invited.map((item, idx) => {
    if (idx === index) {
      return { ...item, signature: signature };
    }
    return item;
  });
  await collection.update({invited: updatedInvited});
  return collection;
};


/**
 * Get a soulbound collection.
 *
 * @param {string} collectionId
 * @returns {Array} collections
 */
const getCollection = async (collectionId) => {
  let collection = await models.Collection.findOne({
    where: { collectionId: collectionId },
    include: [
      {
        model: models.Soulbound,
        as: 'tokens',
      },
    ],
  });
  if (!collection) {
    console.log("Collection does not exist");
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
  let { name, symbol, description, smartContract, policyId, policyHash, policy, mint, redeem, invited, aikenCourse } = body;

  const collectionPayload = {
    owner: userId,
    name,
    symbol,
    description,
    smartContract,
    policyId,
    policyHash,
    policy,
    mint,
    redeem,
    invited,
    aikenCourse,
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
  let { name, beneficiary, beneficiary_stake, metadata, mintUtxo, aikenCourseApproved } = body;

  let collection = await models.Collection.findOne({ where: { collectionId }});
  if (!collection) {
    console.log(`...error cannot find collection: ${collectionId}!`);
    errorService.stashBadRequest('Soulbound not created', 'not-created');
    return false;
  }


  const soulboundPayload = {
    collectionId,
    name,
    beneficiary,
    beneficiary_stake,
    metadata,
    mintUtxo: mintUtxo,
    claimUtxo: null,
    burnTx: null,
    aikenCourseApproved: aikenCourseApproved,
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
 * Update a soulbound to a collection.
 *
 * @param {string} collectionId
 * @returns {Array} soulbound
 */
const updateUserCollection = async (params, updates) => {

  let { collectionId } = params;

  let collection = await models.Collection.findOne({ where: { collectionId }});
  if (!collection) {
    console.log(`...error cannot find collection: ${collectionId}!`);
    errorService.stashBadRequest('Soulbound not created', 'not-created');
    return false;
  }

  await collection.update(updates);


  return collection;
}

/**
 * Update a soulbound.
 *
 * @param {string} soulboundId
 * @returns {Array} soulbound
 */
const updateCollectionSoulbound = async (params, updates) => {

  let { soulboundId, collectionId } = params;

  let soulbound = await models.Soulbound.findOne({ where: { soulboundId, collectionId }});
  if (!soulbound) {
    console.log(`...error cannot find soulbound: ${soulboundId}!`);
    errorService.stashBadRequest('Soulbound not updated', 'not-updated');
    return false;
  }

  const updatedSoulbound = await soulbound.update(updates);

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

/**
 * Get all soulbound collections a user is the beneficiary.
 *
 * @param {string} userId
 * @returns {Array} collections
 */
const getUserClaimableSoulbounds = async (userId) => {
  let collections = await models.Soulbound.findAll({
    include: [{
      model: models.Collection,
      as: 'collection',
      required: true // This will make an inner join, optional: false would make it a left join
    }],
    where: {
      beneficiary_stake: {
        [Op.eq]: userId
      },
    }
  });
  return collections;
};



module.exports = {
  getAllUserCollections,
  getAllUserInvitedCollections,
  updateUserCollection,
  signCollection,
  getCollection,
  addUserCollection,
  addCollectionSoulbound,
  updateCollectionSoulbound,
  getCollectionSoulbounds,
  getUserClaimableSoulbounds
};
