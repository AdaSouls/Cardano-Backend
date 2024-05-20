const httpStatus = require("http-status");
const catchAsync = require("../util/catchAsync");
const { codeService, errorService, assetService } = require("../service");

/*
|--------------------------------------------------------------------------
| NFT assets.
|--------------------------------------------------------------------------
*/

/**
 * Get all NFT asset records.
 */
const addRoleToUser = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "addRoleToUser")) {
    errorService.emitStashedError(res);
    return;
  }

  const assets = await assetService.getAllNftAssets();

  if (assets === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(assets.map((asset) => asset.toSanitisedJson()));
});

/*
|--------------------------------------------------------------------------
| Exports.
|--------------------------------------------------------------------------
*/

module.exports = {
  addRoleToUser,
};
