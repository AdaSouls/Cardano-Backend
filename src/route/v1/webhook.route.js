const express = require('express');
const router = express.Router();
const webhookController = require('../../controller/webhook.controller');

router.route('/alchemy/stakingEvent').post(webhookController.stakingEvent);

module.exports = router;
