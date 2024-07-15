const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const collectionController = require('../../controller/collection.controller');
const collectionValidation = require('../../validation/collection.validation');

router.route('/:collectionId/user/:userId/sign').post(validate(collectionValidation.signCollection), collectionController.signCollection);
router.route('/:userId').post(validate(collectionValidation.addUserCollection), collectionController.addUserCollection);

// SOULBOUNDS
router.route('/:collectionId').get(validate(collectionValidation.getCollection), collectionController.getCollection);
router.route('/:collectionId/soulbounds').get(validate(collectionValidation.getCollectionSoulbounds), collectionController.getCollectionSoulbounds);
router.route('/:collectionId/soulbounds').post(validate(collectionValidation.addCollectionSoulbound), collectionController.addCollectionSoulbound);
router.route('/:collectionId/soulbounds/:soulboundId').patch(validate(collectionValidation.updateCollectionSoulbound), collectionController.updateCollectionSoulbound);

module.exports = router;
