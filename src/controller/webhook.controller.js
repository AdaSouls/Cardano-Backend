const httpStatus = require("http-status");
const catchAsync = require("../util/catchAsync");
const webhookService = require('../service/webhook.service');
const config = require('../config/config');
const blockfrost = require("@blockfrost/blockfrost-js");
const { verifyWebhookSignature } = blockfrost;

const tokenLockEvent = catchAsync(async (req, res) => {

  // Validate the webhook signature
  const signatureHeader = req.headers["blockfrost-signature"];
  try {
    const event = verifyWebhookSignature(
      JSON.stringify(req.body), // Stringified request.body (Note: In AWS Lambda you don't need to call JSON.stringify as event.body is already stringified)
      signatureHeader,
      config.web3.blockfrost.secretAuthToken,
      600 // Optional param to customize maximum allowed age of the webhook event, defaults to 600s
    );

    // Signature is valid, process the event
    console.log(`Received ${req.body.type}`)
    console.log(`Payload is: ${req.body.payload[0]}`);
    console.log(`Tx is: ${req.body.payload[0].tx}`);
    console.log(`Inputs are: ${req.body.payload[0].inputs}`);
    console.log(`Outputs are: ${req.body.payload[0].outputs}`);

    // 1. Check tokens ALDEA are present and the amount is enough
    // 2. Check it is signed by owner of smart contract
    // 3. Check it is signed by owner of the funds
    // 4. Create ERC20 minting transaction in Milkomeda

    res.status(httpStatus.OK).send();

  } catch (error) {
    // In case of invalid signature verifyWebhookSignature will throw SignatureVerificationError
    // for easier debugging you can access passed signatureHeader and webhookPayload values (error.detail.signatureHeader, error.detail.webhookPayload)
    console.error(error);
    return res.status(400).send("Signature is not valid!");
  }

});

module.exports = {
  tokenLockEvent,
};
