const catchAsync = require('../util/catchAsync');
const httpStatus = require('http-status');
const codeService = require('../service/code.service');
const errorService = require('../service/error.service');
const collectionService = require('../service/collection.service');

/*
|--------------------------------------------------------------------------
| Soulbound Collections Data.
|--------------------------------------------------------------------------
*/

/**
 * Get a list of all the soulbound collections that a user has created.
 */
const getUserCollections = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getUserCollections')) {
    errorService.emitStashedError(res);
    return;
  }

  const collections = await collectionService.getAllUserCollections(req.params.userId);

  if (!collections) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(collections.map((collection) => collection.toSanitisedJson()));

});

/**
 * Get a list of all the soulbound collections that a user has been invited to.
 */
const getUserInvitedCollections = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getUserInvitedCollections')) {
    errorService.emitStashedError(res);
    return;
  }

  const collections = await collectionService.getAllUserInvitedCollections(req.params.userId);

  if (!collections) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(collections.map((collection) => collection.toSanitisedJson()));

});

/**
 * Sign a soulbound collection that a user has been invited to.
 */
const signCollection = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'signCollection')) {
    errorService.emitStashedError(res);
    return;
  }

  const collection = await collectionService.signCollection(req.params.collectionId, req.params.userId, req.body.signature);

  if (!collection) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(collection.toSanitisedJson());

});

/**
 * Get a soulbound collection.
 */
const getCollection = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getCollection')) {
    errorService.emitStashedError(res);
    return;
  }

  const collection = await collectionService.getCollection(req.params.collectionId);

  if (!collection) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send({...collection.toSanitisedJson(), tokens: collection.tokens.map(token => token.toSanitisedJson())});

});

/**
 * Add a soulbound collection to a user.
 */
const addUserCollection = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'addUserCollection')) {
    errorService.emitStashedError(res);
    return;
  }

  const newCollection = await collectionService.addUserCollection(req.params, req.body);

  if (!newCollection) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(newCollection.toSanitisedJson());

});

/**
 * Update a soulbound collection to a user.
 */
const updateUserCollection = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'updateUserCollection')) {
    errorService.emitStashedError(res);
    return;
  }

  const updateCollection = await collectionService.updateUserCollection(req.params, req.body);

  if (!updateCollection) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(updateCollection.toSanitisedJson());

});

/**
 * Add a soulbound to a collection.
 */
const addCollectionSoulbound = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'addCollectionSoulbound')) {
    errorService.emitStashedError(res);
    return;
  }

  const newSoulbound = await collectionService.addCollectionSoulbound(req.params, req.body);

  if (!newSoulbound) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(newSoulbound.toSanitisedJson());

});


/**
 * Update a soulbound .
 */
const updateCollectionSoulbound = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'updateCollectionSoulbound')) {
    errorService.emitStashedError(res);
    return;
  }

  const updatedSoulbound = await collectionService.updateCollectionSoulbound(req.params, req.body);

  if (!updatedSoulbound) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(updatedSoulbound.toSanitisedJson());

});

/**
 * Get Collection soulbounds
 */
const getCollectionSoulbounds = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getCollectionSoulbounds')) {
    errorService.emitStashedError(res);
    return;
  }

  const soulbounds = await collectionService.getCollectionSoulbounds(req.params.collectionId);
  if (!soulbounds) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(soulbounds.map((soulbound) => soulbound.toSanitisedJson()));

});

/**
 * Get a list of all user's claimable souldbounds.
 */
const getUserClaimableSoulbounds = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getUserClaimableSoulbounds')) {
    errorService.emitStashedError(res);
    return;
  }

  const tokens = await collectionService.getUserClaimableSoulbounds(req.params.userId);

  if (!tokens) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(tokens.map((t) => ({...t.toSanitisedJson(), collection: t.collection.toSanitisedJson()})));

});

module.exports = {
  getUserCollections,
  getUserInvitedCollections,
  signCollection,
  getCollection,
  addUserCollection,
  getCollectionSoulbounds,
  addCollectionSoulbound,
  updateCollectionSoulbound,
  getUserClaimableSoulbounds
};
