/*
|--------------------------------------------------------------------------
| Predeclare exports (to mitigate circular dependencies).
|--------------------------------------------------------------------------
*/

module.exports = {
  getAllSpo,
}

const config = require('../config/config');
const errorService = require('./error.service');
const assetService = require('./asset.service');
const Blockfrost = require("@blockfrost/blockfrost-js");

const API = new Blockfrost.BlockFrostAPI({
  projectId: config.web3.blockfrost.apiKey, // see: https://blockfrost.io
});

/**
 * Gets the transaction response object and then waits for
 * an X amount of block confirmations.
 */
async function getAllSpo() {
  try {

    const pools = await API.poolsExtended({ page: 1, count: 10, order: "asc" });

    return pools;
  } catch (e) {
    console.log(e.message);
    errorService.stashInternalErrorFromException(e, 'Svc:Cardano:getAllSpo: ');
    return false;
  }
}
