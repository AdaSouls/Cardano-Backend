const { Web3 } = require("web3");
const web3 = new Web3();
const models = require("../model");
const userService = require('../service/user.service');
const config = require('../config/config');
const points = require('../util/pointsMultiplier');

const eventData = [
  {type: 'uint40', name: 'date'},
  {type: 'uint16', name: 'poolIndex'},
  {type: 'uint40', name: 'depositIndex'},
  {type: 'uint256', name: 'amount'}
];

async function processEventLog (logs, chain) {

  let message;

  for (let i = 0; i < logs.length; i++) {
    if (logs[i].topics[0] === config.points.staking.depositedEvent) {
      // DEPOSITED EVENT
      const staker = "0x" + logs[i].topics[1].slice(26);
      const decodedParameters = web3.eth.abi.decodeParameters(eventData, logs[i].data);
      const date = decodedParameters[0];
      const poolIndex = decodedParameters[1];
      const depositIndex = decodedParameters[2];
      const amount = web3.utils.fromWei(decodedParameters[3], "ether" );

      // Get user id by external wallet
      let user = await userService.getUserByMotorverseOrExternalWallet(staker.toLowerCase());

      let userId;

      if (user) {
        userId = user.dataValues.id;
      }

      let stakingEventDate = new Date(0);
      stakingEventDate.setUTCSeconds(Number(date));

      // Save to Stake database
      const stakePayload = {
        chain,
        walletAddress: staker,
        smartContractAddress: logs[i].transaction.to.address,
        stakingTransactionHash: logs[i].transaction.hash,
        stakingEventDate,
        lockPeriod: 30,
        amount: amount.toString(),
        poolIndex: Number(poolIndex),
        depositIndex: Number(depositIndex),
        status: "staked",
        userId: userId ?? undefined
      };

      let newStake = await models.Stake.create(stakePayload);

      if (!newStake) {
        console.log('....error saving stake to database');
        errorService.stashNotFound('Stake failed', 'failed');
        return false;
      }

      message = `${staker} locked ${amount} REVV to ${chain}/${logs[i].transaction.to.address} with transaction ${logs[i].transaction.hash} using pool ${poolIndex}/${depositIndex} on ${stakingEventDate}`;

      // Get amount of days based on poolIndex
      let days;
      switch (Number(poolIndex)) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
          days = 30;
          break
        default:
          days = 0;
      }

      // Update user's points and add points history entry
      if (userId) {

        let multipliers = await points.stakingPointsMultiplier(1, 30, amount.toString());
        let calcMultiplier = points.reduceMultiplier(multipliers);
        let pointsToAdd = Math.round(days * 0.001 * Number(amount) * calcMultiplier);

        // Award points to user
        user.points = Number(user.points) + pointsToAdd;
        await user.save();

        const pointsHistoryPayload = {
          eventType: chain === "ethereum" ? "staking - ethereum" : "staking - polygon",
          timeframe: 30,
          amountStaked: amount.toString(),
          daysStaked: days,
          campaignNumber: 1,
          multipliers,
          pointsAwarded: calcMultiplier === -1 ? 0 : pointsToAdd,
          userId,
          status: calcMultiplier === -1 ? "pending - error with multipliers" : "credited",
        }

        let newPointHistory = await models.PointsHistory.create(pointsHistoryPayload);

        if (!newPointHistory) {
          console.log('....error saving points history');
          errorService.stashNotFound('PointsHistory failed', 'failed');
          return false;
        }

      }

    } else if (logs[i].topics[0] === config.points.staking.withdrawnEvent) {
      // WITHDRAWN EVENT
      const staker = "0x" + logs[i].topics[1].slice(26);
      const decodedParameters = web3.eth.abi.decodeParameters(eventData, logs[i].data);
      const date = decodedParameters[0];
      const poolIndex = decodedParameters[1];
      const depositIndex = decodedParameters[2];
      const amount = web3.utils.fromWei(decodedParameters[3], "ether" );

      // Get user id by external wallet
      let user = await userService.getUserByMotorverseOrExternalWallet(staker.toLowerCase());

      let userId;

      if (user) {
        userId = user.dataValues.id;
      }

      let withdrawEventDate = new Date(0);
      withdrawEventDate.setUTCSeconds(Number(date));

      let {number, stakes} = await userService.updateUserStake(staker, logs[i].transaction.hash, Number(poolIndex), Number(depositIndex), amount.toString(), withdrawEventDate);

      if (number === 0) {
        message = `stake not found for user ${userId} - wallet ${staker} - poolIndex ${Number(poolIndex)} - depositIndex ${Number(depositIndex)} and amount ${amount.toString()}`
        return message;
      } else {
        console.log("stake updated");
        console.log(stakes[0]);
      }

      message = `${staker} withdrawn ${amount} REVV from ${chain}/${logs[i].transaction.to.address} with transaction ${logs[i].transaction.hash} using pool ${poolIndex}/${depositIndex} on ${withdrawEventDate}`;

    } else {
      message = `event ${logs[i].topics[0]} not recognised`
    }

  }

  return message;

}

module.exports = {
  processEventLog,
};
