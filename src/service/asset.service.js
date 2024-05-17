/*
|--------------------------------------------------------------------------
| Predeclare exports (to mitigate circular dependencies).
|--------------------------------------------------------------------------
*/

module.exports = {
  getAllNftAssets,
  getNftAssetByAddress,
  getNftAddresses,
  syncNftAsset,
  deleteNftAsset,
  flushAssetListCaches,
};


const models = require("../model");
const errorService = require("./error.service");
const config = require('../config/config');

/*
|--------------------------------------------------------------------------
| NFT assets, basic CRUD support.
|--------------------------------------------------------------------------
*/

/**
 * Get all NFT assets.
 */
async function getAllNftAssets() {
  try {

    let assets = await getCachedNftAssetList();
    if (assets !== false && assets !== null) {
      console.log("Svc:Assets:getAllNftAssets: FROM CACHE");
      return assets.map((asset) => new models.NftAsset(asset));
    }

    assets = await models.Asset.findAll();
    console.log("Svc:Assets:getAllNftAssets: FROM DB");

    // save to cache
    saveCachedNftAssetList(assets);

    return assets;
  } catch (e) {
    console.log("Svc:Assets:getAllAssets error", e);
    errorService.stashInternalErrorFromException(e, "Svc:Assets:getAllAssets: ");
    return false;
  }
}

/**
 * Get a single NFT asset by smart contract address.
 */
async function getNftAssetByAddress(address) {
  try {
    // getting the full asset list forces a re-caching if not currently in cache
    let assets = await getAllNftAssets();
    if (assets === false) {
      errorService.stashInternalError('Error getting assets');
      return false;
    }

    address = address.toLowerCase();
    const asset = assets.find((asset) => asset.address === address);
    if (!asset) {
      errorService.stashNotFound('Asset not found');
      return false;
    }

    return asset;
  } catch (e) {
    errorService.stashInternalErrorFromException(e, "Svc:Assets:getAssetByAddress: ");
    return false;
  }
}

/**
 * Get all nft addresses for the given game. To be included it has to have
 * some game data for the game.
 */
async function getNftAddresses(useCache = true) {
  try {
    if (useCache) {
      const cached = await getCachedNftAssetList();

      if (cached) {
        console.log(`Svc:Assets:getNftAddresses: USE CACHE `, cached);
        return cached;
      }
    }

    let assets = await getAllNftAssets();
    let addresses = [];

    for (const asset of assets) {
      if (!config.web3.supportedChains.includes(asset.chain)) {
        continue;
      }
      addresses.push(asset.address);
    }

    return addresses;
  } catch (e) {
    console.log("Svc:Assets:getNftAddresses error", e);
    errorService.stashInternalErrorFromException(e, "Svc:Assets:getNftAddresses: ");
    return false;
  }
}


/**
 * Sync an NFT asset - update if exists, o/w create.
 */
async function syncNftAsset(asset) {
  try {
    asset.tokenType = asset.tokenType?.toLowerCase();
    asset.chain = asset.chain?.toLowerCase();
    asset.address = asset.address?.toLowerCase();
    asset.operatorAddress = asset.operatorAddress?.toLowerCase();

    const [syncedAsset, created] = await models.Asset.upsert(asset, {
      fields: Object.keys(asset),
      conflictFields: ["address"],
    });

    return { asset: syncedAsset, created };
  } catch (e) {
    console.log("Svc:Assets:syncNftAsset upsert error", e);
    errorService.stashInternalErrorFromException(e, "Svc:Assets:syncNftAsset: ");
    return false;
  }
}

/**
 * Delete an NFT asset.
 */
async function deleteNftAsset(address) {
  try {
    const asset = await models.Asset.findOne({
      where: { address: address.toLowerCase() },
    });

    if (!asset) {
      errorService.stashNotFound("Asset not found");
      return false;
    }

    await asset.destroy();

    return true;
  } catch (e) {
    console.log("Svc:Assets:deleteAsset error", e);
    errorService.stashInternalErrorFromException(e, "Svc:Assets:deleteAsset: ");
    return false;
  }
}

/*
|--------------------------------------------------------------------------
| REDIS management of the NFT asset list.
|--------------------------------------------------------------------------
*/

/**
 * Clear the asset list caches.
 */
async function flushAssetListCaches() {
  try {
    //await delCachedErc20AssetList();
    //await delCachedErc20AssetAddressesList();
    await delCachedNftAssetList();
    return true;
  } catch (e) {
    errorService.stashInternalErrorFromException(e, "Svc:Assets:flushAssetListCache: ");
    return false;
  }
}

function getNftRedisKey() {
  return "all-nft-assets";
}

async function getCachedNftAssetList() {
  try {
    return await redisService.getJSON(getNftRedisKey());
  } catch (e) {
    return false;
  }
}

async function saveCachedNftAssetList(assets) {
  try {
    await redisService.setJSON(getNftRedisKey(), assets || []);
    return true;
  } catch (e) {
    return false;
  }
}

async function delCachedNftAssetList() {
  try {
    await redisService.del(getNftRedisKey());
    return true;
  } catch (e) {
    return false;
  }
}
