const express = require('express');
const router = express.Router();
const validate = require('../../middleware/validate');
const userController = require('../../controller/user.controller');
const userValidation = require('../../validation/user.validation');

router.route('/verifyAccount').post(validate(userValidation.verifyAccount), userController.verifyAccount);
router.route('/generateOtp').post(userController.generateOtp);
router.route('/linkGame').post(validate(userValidation.linkGame), userController.linkGame);
router.route('/linkExternalWallet').post(validate(userValidation.linkExternalWallet), userController.linkExternalWallet);
router.route('/unlinkExternalWallet').post(validate(userValidation.unlinkExternalWallet), userController.unlinkExternalWallet);
router.route('/linkGameWallet').post(validate(userValidation.linkGameWallet), userController.linkGameWallet);
router.route('/unlinkGameWallet').post(userController.unlinkGameWallet);
router.route('/generateCustomJwt').post(validate(userValidation.generateCustomJwt), userController.generateCustomJwt);
router.route('/generateMocaverseJwt').post(validate(userValidation.generateMocaverseJwt), userController.generateMocaverseJwt);

module.exports = router;
