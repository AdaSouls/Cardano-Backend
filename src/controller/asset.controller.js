const config = require("../config/config");
const { ethers } = require('ethers');
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
const getAllNftAssets = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getAllNftAssets")) {
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

/**
 * Get NFT asset by address.
 */
const getNftAssetByAddress = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getNftAssetByAddress")) {
    errorService.emitStashedError(res);
    return;
  }

  const asset = await assetService.getNftAssetByAddress(req.params.address);

  if (asset === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(asset.toSanitisedJson());
});

/**
 * Sync an NFT asset to the master list. Update if it already exists, create if it doesn't.
 */
const syncNftAsset = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "syncNftAsset")) {
    errorService.emitStashedError(res);
    return;
  }

  const asset = req.body;
  const resp = await assetService.syncNftAsset(asset);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send({ created: resp.created, asset: resp.asset.toSanitisedJson() });
});

/**
 * Sync an ERC20 asset to the master list. Update if it already exists, create if it doesn't.
 */
const syncErc20Asset = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "syncErc20Asset")) {
    errorService.emitStashedError(res);
    return;
  }

  const data = req.body;
  const resp = await assetService.syncErc20Asset(data);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send({ created: resp.created, asset: resp.asset.toSanitisedJson() });
});

/**
 * Delete NFT asset.
 */
const deleteNftAsset = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "deleteNftAsset")) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await assetService.deleteNftAsset(req.params.address);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});

/**
 * Check NFT asset smart contract deployment.
 */
const checkNftAssetDeploy = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "checkNftAssetDeploy")) {
    errorService.emitStashedError(res);
    return;
  }

  const assetDeploySummary = await assetService.getNftAssetDeploySummary(req.params.address, req.body.paymentTokens);

  if (assetDeploySummary === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(assetDeploySummary);
});

/**
 * Get NFT asset supply summary.
 */
const getNftAssetSupplySummary = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getNftAssetSupplySummary")) {
    errorService.emitStashedError(res);
    return;
  }

  const assetSummary = await assetService.getNftAssetSupplySummary(req.params.address);

  if (assetSummary === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(assetSummary);
});

/**
 * Get a price summary for all NFTs. This includes getting current trading price of REVV from Coin Market Cap
 * and suggesting an ideal price for REVV based on a given discount.
 */
const getAllNftAssetsPrices = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getAllNftAssetsPrices")) {
    errorService.emitStashedError(res);
    return;
  }

  const data = await assetService.getAllNftAssetsPrices(parseInt(req.query?.discount || req.params?.discount || req.body?.discount || 0));

  if (data === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(data);
})


const getNftEvents = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getNftEvents")) {
    errorService.emitStashedError(res);
    return;
  }

  const nftEventsResponse = await web3Service.getNftEvents(req.params.address, req.body);

  if (nftEventsResponse === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});

const getNftHolders = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getNftHolders")) {
    errorService.emitStashedError(res);
    return;
  }

  const nftHoldersResponse = await alchemyService.getNftHolders(req.params.address, req.body.withBalances);

  if (nftHoldersResponse === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(nftHoldersResponse);
});

const subscribeCollection = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "subscribeCollection")) {
    errorService.emitStashedError(res);
    return;
  }

  const response = await openseaService.subscribeCollection(req.params.slug);

  if (response === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(response);
});


/*
|--------------------------------------------------------------------------
| Web2 assets.
|--------------------------------------------------------------------------
*/

/**
 * Get all Web2 asset records.
 */
const getAllWeb2Assets = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getAllWeb2Assets")) {
    errorService.emitStashedError(res);
    return;
  }

  const assets = await assetService.getAllWeb2Assets();

  if (assets === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(assets.map((asset) => asset.toSanitisedJson()));
});

/**
 * Get Web2 asset by TmItemId.
 */
const getWeb2AssetByTmItemId = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getWeb2AssetByTmItemId")) {
    errorService.emitStashedError(res);
    return;
  }

  const asset = await assetService.getWeb2AssetByTmItemId(req.params.tmItemId);

  if (asset === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(asset.toSanitisedJson());
});

/**
 * Get Web2 asset by In-Game Id..
 */
const getWeb2AssetByInGameId = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getWeb2AssetByInGameId")) {
    errorService.emitStashedError(res);
    return;
  }

  const asset = await assetService.getWeb2AssetByInGameId(req.body.inGameId);

  if (asset === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(asset.toSanitisedJson());
});

/**
 * Sync a Web2 asset to the master list. Update if it already exists, create if it doesn't.
 */
const syncWeb2Asset = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "syncWeb2Asset")) {
    errorService.emitStashedError(res);
    return;
  }

  const asset = req.body;
  const resp = await assetService.syncWeb2Asset(asset);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send({ created: resp.created, asset: resp.asset.toSanitisedJson() });
});

/**
 * Bulk sync a list of Web2 assets to the master list.
 */
const bulkSyncWeb2Assets = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "bulkSyncWeb2Asset")) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await assetService.bulkSyncWeb2Assets(req.body.data);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(resp);
});

/**
 * Delete a Web2 asset.
 */
const deleteWeb2Asset = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "deleteWeb2Asset")) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await assetService.deleteWeb2Asset(req.params.tmItemId);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});


/*
|--------------------------------------------------------------------------
| User Web2 assets.
|--------------------------------------------------------------------------
*/

/**
 * Get all web2 assets for a user.
 */
const getAllUserWeb2Assets = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getUserWeb2Assets")) {
    errorService.emitStashedError(res);
    return;
  }

  const assets = await assetService.getUserWeb2Assets(req.params.userId);

  if (assets === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(assets.map(asset => asset.toSanitisedJson()));
  // res.status(httpStatus.OK).send(assets);
});

/**
 * Add a web2 asset for a user.
 */
const addUserWeb2Asset = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "addUserWeb2Asset")) {
    errorService.emitStashedError(res);
    return;
  }

  const data = {
    userId: req.params.userId,
    src: req.body.src,
    tmItemId: req.body.tmItemId,
    cartId: req.body.cartId,
    amtUSD: req.body.amtUSD,
  };

  const asset = await assetService.addUserWeb2Asset(data, req.body._strict);

  if (asset === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(asset);
});

/**
 * Add promo web2 assets for a user.
 */
const addUserPromoWeb2Assets = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "addUserPromoWeb2Assets")) {
    errorService.emitStashedError(res);
    return;
  }

  const data = {
    userId: req.params.userId,
    tmItemIds: req.body.tmItemIds,
  };

  const resp = await assetService.addUserPromoWeb2Assets(data, req.body._strict);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});

/**
 * Add a web2 asset for a user, by specifying the in-game ID instead of the web2 asset uuid.
 */
const addUserWeb2AssetByInGameId = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "addUserWeb2Asset")) {
    errorService.emitStashedError(res);
    return;
  }

  const data = {
    userId: req.params.userId,
    src: req.body.src,
    inGameId: req.body.inGameId,
    cartId: req.body.cartId,
    amtUSD: req.body.amtUSD,
  };

  const asset = await assetService.addUserWeb2AssetByInGameId(data);

  if (asset === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send(asset);
});

/**
 * Delete a web2 asset for a user.
 */
const deleteUserWeb2Asset = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "deleteUserWeb2Asset")) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await assetService.deleteUserWeb2Asset(req.params.userId, req.body.assetInstanceId, req.body.src);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});

/**
 * Delete all promo web2 assets for a user.
 */
const deleteUserWeb2AssetAllPromo = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "deleteUserWeb2AssetAllPromo")) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await assetService.deleteUserWeb2AssetAllPromo(req.params.userId);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});

/**
 * Gift a web2 asset to a list of users.
 */
const web2BulkGift = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "web2BulkGift")) {
    errorService.emitStashedError(res);
    return;
  }

  const options = {
    tmItemId: req.body.tmItemId,
    src: req.body.src,
    tag: req.body.tag || null,
    userIds: req.body.userIds,
    unique: req.body.unique,
  };

  const resp = await assetService.web2BulkGift(options);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});


/*
|--------------------------------------------------------------------------
| Fake Web3.
|--------------------------------------------------------------------------
*/

/**
 * Turn fake web3 ON for an asset instance.
 */
const fakeWeb3On = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "fakeWeb3On")) {
    errorService.emitStashedError(res);
    return;
  }

  const options = {
    userId: req.params.userId,
    assetInstanceId: req.params.assetInstanceId,
    on: true,
  };

  const resp = await assetService.fakeWeb3(options);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});

/**
 * Turn fake web3 OFF for an asset instance.
 */
const fakeWeb3Off = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "fakeWeb3Off")) {
    errorService.emitStashedError(res);
    return;
  }

  const options = {
    userId: req.params.userId,
    assetInstanceId: req.params.assetInstanceId,
    on: false,
  };

  const resp = await assetService.fakeWeb3(options);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send();
});


/*
|--------------------------------------------------------------------------
| REDIS cache management.
|--------------------------------------------------------------------------
*/

/**
 * Flush the asset list caches.
 */
const flushCaches = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "flushCache")) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await assetService.flushAssetListCaches();

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send({ status: "ok" });
});


/*
|--------------------------------------------------------------------------
| NFT Monitoring
|--------------------------------------------------------------------------
*/

/**
 * Restart smart contract monitoring. Useful after reseeding the NFT asset list.
 */
const restartNftMonitoring = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, 'restartNftMonitoring')) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await web3Service.restartNftMonitoring();
  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send({ status: "ok" });
});


/*
|--------------------------------------------------------------------------
| Exports.
|--------------------------------------------------------------------------
*/

module.exports = {
  getAllNftAssets,
  getNftAssetByAddress,
  syncNftAsset,
  syncErc20Asset,
  deleteNftAsset,
  getNftAssetSupplySummary,
  checkNftAssetDeploy,
  getAllNftAssetsPrices,
  getNftEvents,
  getNftHolders,
  subscribeCollection,

  getAllWeb2Assets,
  getWeb2AssetByTmItemId,
  getWeb2AssetByInGameId,
  syncWeb2Asset,
  bulkSyncWeb2Assets,
  deleteWeb2Asset,

  getAllUserWeb2Assets,
  addUserWeb2Asset,
  addUserPromoWeb2Assets,
  addUserWeb2AssetByInGameId,
  deleteUserWeb2Asset,
  deleteUserWeb2AssetAllPromo,
  web2BulkGift,

  fakeWeb3On,
  fakeWeb3Off,

  flushCaches,

  restartNftMonitoring,
};
