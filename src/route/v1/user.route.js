const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const userController = require('../../controller/user.controller');
const userValidation = require('../../validation/user.validation');

router.route('/login').post(validate(userValidation.userLogin), userController.userLogin);
router.route('/generateOtp').post(userController.generateOtp);
router.route('/linkGame').post(validate(userValidation.linkGame), userController.linkGame);
router.route('/linkExternalWallet').post(validate(userValidation.linkExternalWallet), userController.linkExternalWallet);
router.route('/unlinkExternalWallet').post(validate(userValidation.unlinkExternalWallet), userController.unlinkExternalWallet);

module.exports = router;
