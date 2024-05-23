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
 * Add a soulbound collection to a user.
 */
const addUserCollection = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'addUserCollection')) {
    errorService.emitStashedError(res);
    return;
  }

  const newCollection = await collectionService.addUserCollection(req.params.userId, req.body);

  if (!newCollection) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(newCollection.toSanitisedJson());

});

module.exports = {
  getUserCollections,
  addUserCollection,
};
