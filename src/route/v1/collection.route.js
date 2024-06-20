const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const collectionController = require('../../controller/collection.controller');
const collectionValidation = require('../../validation/collection.validation');

router.route('/:userId').get(validate(collectionValidation.getUserCollections), collectionController.getUserCollections);
router.route('/getUserInvited/:userId').get(validate(collectionValidation.getUserInvitedCollections), collectionController.getUserInvitedCollections);
router.route('/sign/:collectionId/:userId').post(validate(collectionValidation.signCollection), collectionController.signCollection);
router.route('/:userId').post(validate(collectionValidation.addUserCollection), collectionController.addUserCollection);

// SOULBOUNDS
router.route('/:collectionId/soulbounds').get(validate(collectionValidation.getCollectionSoulbounds), collectionController.getCollectionSoulbounds);
router.route('/:collectionId/soulbounds').post(validate(collectionValidation.addCollectionSoulbound), collectionController.addCollectionSoulbound);
router.route('/:collectionId/soulbounds/:soulboundId').patch(validate(collectionValidation.updateCollectionSoulbound), collectionController.updateCollectionSoulbound);

module.exports = router;
