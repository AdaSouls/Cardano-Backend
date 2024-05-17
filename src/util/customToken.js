const BigNumber = require('bignumber.js');
const _ = require('lodash');


/**
 * Custom Token Format Version
 */
const VERSION_BITS = 5;
const VERSION1 = 1;

/**
 * Company
 */
const COMPANY_BITS = 8;
const COMPANY_GREASE_MONKEY_GAMES = 1;

/**
 * Token Type
 */
const TOKEN_TYPE_BITS = 8;
const TOKEN_TYPE_ERC20 = 1;
const TOKEN_TYPE_NFT_ERC721 = 2;
const TOKEN_TYPE_NFT_ERC1155 = 3;

/**
 * Asset Type
 */
const ASSET_TYPE_BITS = 8;
const ASSET_TYPE_CAR = 1;
const ASSET_TYPE_PART = 2;
const ASSET_TYPE_PAINT = 3;
const ASSET_TYPE_LIVERY = 4;
const ASSET_TYPE_DECAL = 5;
const ASSET_TYPE_TRACK = 6;
const ASSET_TYPE_DRIVER = 7;
const ASSET_TYPE_MOTORBIKE = 8;

/**
 * Internal Smart Contract ID
 */
const INTERNAL_SMART_CONTRACT_ID_BITS = 20;

/**
 * Internal Token ID
 */
const INTERNAL_TOKEN_ID_BITS = 16;

/**
 * Original Token ID
 */
const ORIGINAL_TOKEN_ID_BITS = 64;

/**
 * The total LHS bits used
 */
const BASE_TOTAL_LHS_BITS = VERSION_BITS + COMPANY_BITS + TOKEN_TYPE_BITS + ASSET_TYPE_BITS + INTERNAL_SMART_CONTRACT_ID_BITS + INTERNAL_TOKEN_ID_BITS;


/**
 * Extract a field freom a binary string (0110011100...)  given starting position and field size.
 */
const extractBinary = (binary, startOffset, numBits) => {
    const start = 255 - startOffset;
    const end = start + numBits;
    const substr = binary.slice(start, end);
    return new BigNumber(substr, 2);
};

/**
 * Extract a field freom a custom token id given starting position and field size.
 */
const extractField = (customTokenId, startOffset, numBits) => {
    const bn = new BigNumber(customTokenId);
    const binary = _.padStart(bn.toString(2), 256, 0);
    const start = 255 - startOffset;
    const end = start + numBits;
    const substr = binary.slice(start, end);
    return new BigNumber(substr, 2);
};

/**
 * Turn a custom token id into a binary string.
 */
const customTokenIdToBinary = customTokenId => {
    const bn = new BigNumber(customTokenId);
    return _.padStart(bn.toString(2), 256, 0);
};

/**
 * Returns the starting bit position given how many bits were used in fields to the left.
 * Returns a number between 0 and 255.
 */
const getStartingBitPosition = bitsUsedPrior => {
    return 256 - bitsUsedPrior - 1;
};

/**
 * Extract the version from a custom token ID.
 */
const getVersionFromCustomTokenId = customTokenId => {
    return extractField(customTokenId, getStartingBitPosition(0), VERSION_BITS);
};

/**
 * Extract the company from a custom token ID.
 */
const getCompanyFromCustomTokenId = customTokenId => {
    return extractField(customTokenId, getStartingBitPosition(VERSION_BITS), COMPANY_BITS);
}

/**
 * Extract the token type from a custom token ID.
 */
const getTokenTypeFromCustomTokenId = customTokenId => {
    return extractField(customTokenId, getStartingBitPosition(VERSION_BITS + COMPANY_BITS), TOKEN_TYPE_BITS);
}

/**
 * Extract the asset type from a custom token ID.
 */
const getAssetTypeFromCustomTokenId = customTokenId => {
    return extractField(customTokenId, getStartingBitPosition(VERSION_BITS + COMPANY_BITS + TOKEN_TYPE_BITS), ASSET_TYPE_BITS);
}

/**
 * Extract the internal smart contract ID from a custom token ID.
 */
const getInternalSmartContractIdFromCustomTokenId = customTokenId => {
    return extractField(customTokenId, getStartingBitPosition(VERSION_BITS + COMPANY_BITS + TOKEN_TYPE_BITS + ASSET_TYPE_BITS), INTERNAL_SMART_CONTRACT_ID_BITS);
}

/**
 * Extract the internal token ID from a custom token ID.
 */
const getInternalTokenIdFromCustomTokenId = customTokenId => {
    return extractField(customTokenId, getStartingBitPosition(VERSION_BITS + COMPANY_BITS + TOKEN_TYPE_BITS + ASSET_TYPE_BITS + INTERNAL_SMART_CONTRACT_ID_BITS), INTERNAL_TOKEN_ID_BITS);
}

/**
 * Extract the original token id from a custom token ID.
 */
const getOriginalTokenIdFromCustomTokenId = customTokenId => {
    return extractField(customTokenId, ORIGINAL_TOKEN_ID_BITS-1, ORIGINAL_TOKEN_ID_BITS);
}



/*
|--------------------------------------------------------------------------
| Exports.
|--------------------------------------------------------------------------
*/

module.exports = {
  extractBinary,
  extractField,
  customTokenIdToBinary,
  getStartingBitPosition,
  getVersionFromCustomTokenId,
  getCompanyFromCustomTokenId,
  getTokenTypeFromCustomTokenId,
  getAssetTypeFromCustomTokenId,
  getInternalSmartContractIdFromCustomTokenId,
  getInternalTokenIdFromCustomTokenId,
  getOriginalTokenIdFromCustomTokenId,
};
