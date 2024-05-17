const express = require('express');
const validate = require('../../middleware/validate');
const walletController = require('../../controller/wallet.controller');
const walletValidation = require('../../validation/wallet.validation');

const router = express.Router();

router.route('/getContent').post(validate(walletValidation.getWalletContent), walletController.getWalletContent);
router.route('/markWallet').post(validate(walletValidation.markWallet), walletController.markWallet);
router.route('/flushCache').post(walletController.flushCache);

module.exports = router;
