const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const collectionController = require('../../controller/collection.controller');
const collectionValidation = require('../../validation/collection.validation');

router.route('/get/:userId').post(validate(collectionValidation.getUserCollections), collectionController.getUserCollections);
router.route('/add/:userId').post(validate(collectionValidation.addUserCollection), collectionController.addUserCollection);

module.exports = router;
