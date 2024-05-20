const catchAsync = require('../util/catchAsync');
const codeService = require('../service/code.service');
const errorService = require('../service/error.service');
const cardanoService = require('../service/cardano.service');

/*
|--------------------------------------------------------------------------
| SPO Data.
|--------------------------------------------------------------------------
*/

/**
 * Get a list of all the stake pools in Cardano.
 */
const getAllSoulbound = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getAllSoulbound')) {
    errorService.emitStashedError(res);
    return;
  }

  const { filterBy } = req.body;
  let spoList;

  if (filterBy === "aldea") {
    ;
  } else {
    spoList = await cardanoService.getAllSpo(req.body);
  }


  if (!spoList) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(spoList);

});

/**
 * Get a list of all the stake pools in Cardano.
 */
const getSoulbound = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getSoulbound')) {
    errorService.emitStashedError(res);
    return;
  }

  const { filterBy } = req.body;
  let spoList;

  if (filterBy === "aldea") {
    ;
  } else {
    spoList = await cardanoService.getAllSpo(req.body);
  }


  if (!spoList) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(spoList);

});

module.exports = {
  getAllSoulbound,
  getSoulbound,
};
