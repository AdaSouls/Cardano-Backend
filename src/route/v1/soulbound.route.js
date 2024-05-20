const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const soulboundController = require('../../controller/soulbound.controller');
const soulboundValidation = require('../../validation/soulbound.validation');

router.route('/getAllCollections').post(validate(soulboundValidation.getAllSoulbound), soulboundController.getAllSoulbound);
router.route('/getCollection/:collectionId').post(validate(soulboundValidation.getSoulbound), soulboundController.getSoulbound);

module.exports = router;
