/*
|--------------------------------------------------------------------------
| Predeclare exports (to mitigate circular dependencies).
|--------------------------------------------------------------------------
*/

module.exports = {
  getContents,
  markWalletAsDirty,
  flushEntireWalletCache,
};



const config = require("../config/config");
const errorService = require("./error.service");
const redisService = require("./redis.service");
const userService = require("./user.service");

/**
 * Get wallet contents. Merges NFT and web2 assets. Delegates NFT content determinations to alchemy, graphql service or ethers service as appropriate.
 * Web2 data is stored in our postgres db. We cache NFT contents on a per-wallet basis, and web2 assets on a per-userId basis.
 */
async function getContents(userId, forceRefresh = false, method = null) {
  console.log('WalletSvc::getContents', {userId, forceRefresh, method});

  try {
    if (!method) {
      method = config.walletContentMethod;
    }
    if (!method) {
      method = 'alchemy';
    }

    /////////////////////////////////////////////////////////////
    // get NFT assets for the given wallet

    let fromCacheNftAddress = false;
    let fromCacheNftSmartAddress = false;
    let timingExtNft = null;
    let timingSmartNft = null;
    //let allData = {
      //data: [],
      //currencies: [],
    //};
    let allData = [];

    let promises = [];

    // Get user wallet address
    let walletAddress = await userService.getUserMvWalletById(userId);

    if (walletAddress) {
      console.log(`...checking ext wallet ${walletAddress}`);
      const resp = await processWeb3(allData, walletAddress, forceRefresh, method);
      console.log(resp);
      if (resp) {
        fromCacheNftAddress = resp.fromCache;
        timingExtNft = resp.timing;
      }
    }
    /*if (smartWalletAddress) {
      console.log(`...checking smart wallet ${smartWalletAddress}`);
      const resp = await processWeb3(allData, gameId, smartWalletAddress, forceRefresh, method);
      if (resp) {
        fromCacheNftSmartAddress = resp.fromCache;
        timingSmartNft = resp.timing;
      }
    }*/

    let resp = { walletAddress, assets: allData, method, fromCacheNftAddress, fromCacheNftSmartAddress, timingExtNft, timingSmartNft };
    /*if (config.walletContentErc20) {
      resp.currencies = allData.currencies;
    } */

    return resp;
  } catch (e) {
    console.log('ERROR', e);
    errorService.stashInternalErrorFromException(e, "Svc:Wallet:getContents: ");

    return false;
  }
}

async function processWeb3(allData, address, forceRefresh, method) {
  const redisKey = getRedisKeyForWallet(address);
  const startTime = performance.now();
  let newData = [];
  //let newCurrencies = [];
  let fromCacheNft = false;

  if (!forceRefresh) {
    newData = await redisService.getJSON(redisKey);
    if (newData) {
      console.log("Svc:Wallet:getContents: GOT DATA FROM CACHE");
      fromCacheNft = true;
    }
  }

  if (!fromCacheNft) {
    switch (method) {
      default:
        errorService.stashBadRequest(`Invalid method: ${method}.`);
        return false;
    }
  }

  const timingNft = performance.now() - startTime;

  if (!fromCacheNft) {
    redisService.setJSON(redisKey, newData);
  }

/*   newData.forEach((element) => {
    const existing = allData.data.find((asset) => asset.assetId === element.assetId);

    console.log("existing: ", existing);

    if (existing && element.type !== "erc20") {
      // console.log('...asset id exists, concat', existing.assetId, element.tokens);
      existing.tokens.concat(element.tokens);
    } else {
      // console.log('...process...no existing, push whole elem', element);
      allData.data.push(element);
    }

    // console.log('...web3 latest data', allData.data);
  }); */

  //allData.currencies = allData.currencies.concat(newCurrencies || []);
  //allData.data.push(newData);
  allData.push(newData);
  return {fromCache: fromCacheNft, timing: timingNft};
}

/*
|--------------------------------------------------------------------------
| REDIS cache management.
|--------------------------------------------------------------------------
*/

/**
 * Get the key for NFT items for a given user/wallet/game combo.
 */
function getRedisKeyForWallet(address) {
  return `nft:${address.toLowerCase()}`;
}

/**
 * Mark the wallet as dirty for either the given game or all games
 * if gameId is null.
 */
async function markWalletAsDirty(address) {
  try {
    //(gameId ? [gameId] : gameService.ALL_GAME_IDS).forEach(async (gameId) => {
    const key = getRedisKeyForWallet(address);
    console.log(`Svc:Wallet:markWalletAsDirty: ${key}`);
    await redisService.del(key);
    //});
    return true;
  } catch (e) {
    console.log(e);
    errorService.stashInternalErrorFromException(e, "Svc:Wallet:markWalletAsDirty: ");
    return false;
  }
}

/**
 * Flush the entire wallet cache.
 */
async function flushEntireWalletCache() {
  try {
    await redisService.flushDb();
    return true;
  } catch (e) {
    console.log(e);
    errorService.stashInternalErrorFromException(e, "Svc:Wallet:flushEntireWalletCache: ");
    return false;
  }
}
