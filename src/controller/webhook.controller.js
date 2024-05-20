const httpStatus = require("http-status");
const catchAsync = require("../util/catchAsync");
const webhookService = require('../service/webhook.service');
const config = require('../config/config');

const stakingEvent = catchAsync(async (req, res) => {

  const webhookEvent = req.body;
  const logs = webhookEvent.event.data.block.logs;
  let message, chain;

  console.log("BODY: ", req.body);
  console.log("LOGS: ", logs);

  if (logs.length === 0) {
    message = "Empty logs array received, skipping";
  } else {

    let smartContractAddress = logs[0].account.address;
    //let transactionHash = logs[0].transaction.hash;

    // Determine what chain I am on
    if (smartContractAddress.toLowerCase() === config.points.staking.ethereum.contractAddress.toLowerCase()) {
      // I am on Ethereum
      chain = "ethereum";
      // Wait for transaction confirmations
      //transactionConfirmed = alchemyService.isTransactionConfirmed(chain, transactionHash, config.points.staking.confirmations);
    } else if (smartContractAddress.toLowerCase() === config.points.staking.polygon.contractAddress.toLowerCase()) {
      // I am on Polygon
      chain = "polygon";
      // Wait for transaction confirmations
      //transactionConfirmed = alchemyService.isTransactionConfirmed(chain, transactionHash, config.points.staking.confirmations);
    } else {
      message = "Chain is not supported";
    }

    console.log("chain: ", chain);

    message = await webhookService.processEventLog(logs, chain);

  }

  console.log(message);

  res.status(httpStatus.OK).send();

});

module.exports = {
  stakingEvent,
};
