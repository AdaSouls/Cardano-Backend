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
const getAllSpo = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'getAllSpo')) {
    errorService.emitStashedError(res);
    return;
  }


  const allSpoList = await cardanoService.getAllSpo(req.body);

  if (!allSpoList) {
    errorService.emitStashedError(res);
    return;
  }

  res.send(allSpoList);

});

module.exports = {
  getAllSpo,
};
