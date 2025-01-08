const express = require('express');
const router = express.Router();
const webhookController = require('../../controller/webhook.controller');

router.route('/blockfrost/tokenLock').post(webhookController.tokenLockEvent);

module.exports = router;
