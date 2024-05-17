const httpStatus = require("http-status");
const catchAsync = require("../util/catchAsync");
const { codeService, errorService, walletService, alchemyService, userService } = require("../service");

/**
 * Get wallet contents as per our asset list.
 */
const getWalletContent = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "getWalletContent")) {
    errorService.emitStashedError(res);
    return;
  }

  console.log('CONTROLLER getWalletContent', req.body);

  const { userId, forceRefresh, method } = req.body;
  const resp = await walletService.getContents(userId, forceRefresh, method);

  if (resp === false) {
    errorService.emitStashedError(res);
    return;
  }

  res.status(httpStatus.OK).send({
    userId,
    address: resp.walletAddress || null,
    //smartWalletAddress: smartWalletAddress || null,
    fromCacheNft: resp.fromCacheNftAddress,
    timingNft: resp.timingExtNft,
    fromCacheNftSmart: resp.fromCacheNftSmartAddress,
    //timingSmartNft: resp.timingSmartNft,
    nftWalletDiscovery: resp.method,
    assets: resp.assets,
    //currencies: resp.currencies,
  });
});

/**
 * Mark a wallet as dirty, either for a particular game, or all games.
 */
const markWallet = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "markWallet")) {
    errorService.emitStashedError(res);
    return;
  }

  let { walletAddress, userId } = req.body;

  if (!walletAddress) {
    walletAddress = await userService.getUserMvWalletById(userId);
  }

  const resp = await walletService.markWalletAsDirty(
    walletAddress
  );

  if (!resp) {
    errorService.internalError(res);
    return;
  }

  res.status(httpStatus.OK).send({
    wallet: walletAddress,
    success: "ok"
  });
});

/**
 * Clear out our cache for all wallets/games.
 */
const flushCache = catchAsync(async (req, res) => {
  if (!codeService.checkCode(req, "flushCache")) {
    errorService.emitStashedError(res);
    return;
  }

  const resp = await walletService.flushEntireWalletCache();

  if (!resp) {
    errorService.internalError(res);
    return;
  }

  res.status(httpStatus.OK).send({ success: "ok" });
});

module.exports = {
  getWalletContent,
  markWallet,
  flushCache,
};
