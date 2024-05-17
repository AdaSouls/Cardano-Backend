const models = require("../model");

let timeframes;
let amountMultipliers;

function between(x, min, max) {
  return x >= min && x <= max;
}

const getTimeframes = (campaignData) => {
  var key;
  let timeframes = [];
  for (key in campaignData.timeframe) {
    if (campaignData.timeframe.hasOwnProperty(key)) {
      let timeframe = {
        days: key,
        multiplier: campaignData.timeframe[key]
      }
      timeframes.push(timeframe);
    }
  }
  return timeframes;
}

const getTimeframeMultiplier = (days) => {
  for (let index = 0; index < timeframes.length; index++) {
    const timeframe = timeframes[index];
    if (Number(timeframe.days) === days) {
      return timeframe.multiplier;
    }
  }
  return -1;
}

const getAmountMultipliers = (campaignData) => {
  var key;
  let amountMultipliers = [];
  for (key in campaignData.amount) {
    if (campaignData.amount.hasOwnProperty(key)) {
      let amountMultiplier = {
        min: campaignData.amount[key].min,
        max: campaignData.amount[key].max,
        multiplier: key
      }
      amountMultipliers.push(amountMultiplier);
    }
  }
  return amountMultipliers;
}

const getAmountMultiplier = (amount) => {
  console.log(amount);
  for (let index = 0; index < amountMultipliers.length; index++) {
    const amountMultiplier = amountMultipliers[index];
    console.log(amountMultiplier);

    // Check if the amount is less or equal than the minimum (only the first time because
    // ranges come in order)
    if (index === 0) {
      if (Number(amount) <= amountMultiplier.min) {
        return 1
      }
    }

    if (between(Number(amount), amountMultiplier.min, amountMultiplier.max)) {
      return Number(amountMultiplier.multiplier);
    }
  }

  return -1;

}

/**
 * Calculates the multiplier for the staking points earned based on timeframe and amount
 * @param {Number} timeframe
 * @param {string} amount
 * @returns {Number}
 */
const stakingPointsMultiplier = async (campaign, timeframe, amount) => {

  // Get campaign data
  try {
    let campaignData = await models.Campaign.findOne({ where: { number: campaign }});
    timeframes = getTimeframes(campaignData.dataValues.details);
    amountMultipliers = getAmountMultipliers(campaignData.dataValues.details);

    // Timeframe
    let timeframeMultiplier = getTimeframeMultiplier(timeframe);
    console.log(timeframeMultiplier);

    // Amount
    let amountMultiplier = getAmountMultiplier(amount);
    console.log(amountMultiplier);

    return {
      timeframeMultiplier,
      amountMultiplier
    }

  } catch (e) {
    console.log(e.message);
    return false;
  }

}

/**
 * Reduces the multipliers to a single number for calculations
 * @param {Object} multipliers
 * @returns {Number}
 */
const reduceMultiplier = (multipliers) => {

  if (multipliers.amountMultiplier === -1) {
    return -1;
  }

  if (multipliers.timeframeMultiplier === -1) {
    return -1;
  }

  return multipliers.amountMultiplier * multipliers.timeframeMultiplier;

}

module.exports = {
  stakingPointsMultiplier,
  reduceMultiplier,
}
