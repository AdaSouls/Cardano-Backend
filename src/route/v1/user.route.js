const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const userController = require('../../controller/user.controller');
const userValidation = require('../../validation/user.validation');
const collectionController = require('../../controller/collection.controller');
const collectionValidation = require('../../validation/collection.validation');

router.route('/login').post(validate(userValidation.userLogin), userController.userLogin);
router.route('/generateOtp').post(userController.generateOtp);
router.route('/linkGame').post(validate(userValidation.linkGame), userController.linkGame);
router.route('/linkExternalWallet').post(validate(userValidation.linkExternalWallet), userController.linkExternalWallet);
router.route('/unlinkExternalWallet').post(validate(userValidation.unlinkExternalWallet), userController.unlinkExternalWallet);

// COLLECTIONS
router.route('/:userId/collections').get(validate(collectionValidation.getUserCollections), collectionController.getUserCollections);
router.route('/:userId/collections/invited').get(validate(collectionValidation.getUserInvitedCollections), collectionController.getUserInvitedCollections);
router.route('/:userId/soulbounds/claimable').get(validate(collectionValidation.getUserClaimableSoulbounds), collectionController.getUserClaimableSoulbounds);

module.exports = router;
