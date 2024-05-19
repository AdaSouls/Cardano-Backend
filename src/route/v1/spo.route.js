const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const spoController = require('../../controller/spo.controller');
const spoValidation = require('../../validation/spo.validation');

router.route('/getAll').post(validate(spoValidation.getAllSpo), spoController.getAllSpo);

module.exports = router;
