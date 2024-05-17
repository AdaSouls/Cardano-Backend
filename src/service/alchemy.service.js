/*
|--------------------------------------------------------------------------
| Predeclare exports (to mitigate circular dependencies).
|--------------------------------------------------------------------------
*/

module.exports = {
  isTransactionConfirmed,
  getWalletContents,
}



const config = require('../config/config');
const errorService = require('./error.service');
const assetService = require('./asset.service');
const { ethers } = require('ethers');
const { getInternalTokenIdFromCustomTokenId } = require('../util/customToken');
const { Network, Alchemy } = require('alchemy-sdk');

const networkEthereumRpcURL = config.web3.networkRpcUrls[0];
const networkPolygonRpcURL = config.web3.networkRpcUrls[1];

/**
 * Gets the transaction response object and then waits for
 * an X amount of block confirmations.
 */
async function isTransactionConfirmed(chain, transactionHash, confirmations) {
  try {

    let provider;
    if (chain === "ethereum") {
      provider = new ethers.providers.JsonRpcProvider(networkEthereumRpcURL);
    } else if (chain === "polygon") {
      provider = new ethers.providers.JsonRpcProvider(networkPolygonRpcURL);
    }

    const transactionResponse = await provider.waitForTransaction(transactionHash, confirmations);

    console.log("Transaction: ", transactionResponse);

    console.log(`Waiting for ${confirmations} confirmations in ${chain}`);

    //await transactionResponse.wait(confirmations);
    return true;
  } catch (e) {
    console.log(e.message);
    errorService.stashInternalErrorFromException(e, 'Svc:Alchemy:isTransactionConfirmed: ');
    return false;
  }
}
/**
 * Get wallet balances from the Alchemy service.
 * See: https://docs.alchemy.com/reference/sdk-getnfts
 */
async function getWalletContents(address) {
  try {
    let startTime = performance.now();
    let promises = [];
    let allAssets = [];

    /* For each chain in the SUPPORTED_CHAINS variable
     * I have to call the getWalletContentsForChain function
     * and append the results
     */
    for (let index = 0; index < config.web3.supportedChains.length; index++) {
      const chain = config.web3.supportedChains[index];
      console.log(`calling getWalletContentsForChain ${chain}`);
      promises.push(getWalletContentsForChain(address, chain, index));
      //const assets = await getWalletContentsForChain(address, chain, index);
      //allAssets.push(assets);
    }

    const responses = await Promise.all(promises);

    responses.forEach((resp) => {
      console.log('resp', resp);
      if (resp) {
        allAssets = allAssets.concat({
          chain: resp?.chain,
          nfts: resp?.data || []
        });
      }
    });

    console.log("NFTs are: ", allAssets);

    startTime = performance.now();

    const procTiming = performance.now() - startTime;
    console.log(`PROC TIMING ${procTiming} ms`);

    return {
      assets: allAssets,
      timing: procTiming,
      //data: erc721Assets.concat(erc1155Assets),
      //data: erc721Assets,
      //currencies: erc20Assets,
      //timing: { alchemyTiming, settings, nfts },
    };
  } catch (e) {
    errorService.stashInternalErrorFromException(e, 'Svc:Alchemy:getWalletContents: ');
    return false;
  }
}

/**
 * Get wallet balances from the Alchemy service for a particular supported chain
 * See: https://docs.alchemy.com/reference/sdk-getnfts
 */
async function getWalletContentsForChain(address, chain, index) {
  try {
    console.log(`GETTING WALLET CONTENTS FROM ${chain}`);

    let startTime = performance.now();

    let settings = {
      apiKey: config.web3.alchemy.apiKeys[index],
    };

    switch (chain) {
      case 'polygon:mumbai':
      case 'polygon:testnet':
        settings.network = Network.MATIC_MUMBAI;
        break;
      case 'polygon:mainnet':
        settings.network = Network.MATIC_MAINNET;
        break;
      case 'ethereum:sepolia':
      case 'ethereum:testnet':
        settings.network = Network.ETH_SEPOLIA;
        break;
      case 'ethereum:mainnet':
        settings.network = Network.ETH_MAINNET;
        break;
      default:
        console.log(`${chain} chain is not supported`);
        return {
          chain,
          data: [],
          message: "chain not supported"
        };
    }

    const alchemy = new Alchemy(settings);
    let promises = [];

    ////////////////////////////////////////////////////////////
    // ERC20 - can be turned on/off in ENV, and we may not even
    // have any tokens in the db to get info for - be prepared

/*     if (config.walletContentErc20) {
      const erc20Addresses = await assetService.getErc20Addresses();
      if (erc20Addresses === false) {
        console.log('...ERROR GETTING ERC20 addresses');
        // TODO: other notifications??
        // but we don't crap out cos we may be able to get other assets at least
        promises.push([]);
      } else if (erc20Addresses.length === 0) {
        console.log('...NO ERC20 addresses to check');
        promises.push([]);
      } else {
        console.log('ERC20 Addresses', erc20Addresses);
        promises.push(alchemy.core.getTokenBalances(address, erc20Addresses));
      }
    } else {
      promises.push([]);
    } */


    ////////////////////////////////////////////////////////////
    // Smart Contract tokens

    let idx = 0;
    let contractAddresses = await assetService.getNftAddresses();
    if (contractAddresses === false) {
      // TODO: don't crap out??? other notifications?
      // return false;
      console.log('ERROR GETTING CONTRACT ADDRESSES');
      contractAddresses = [];
    }
    console.log('ALCHEMY all contract addresses', contractAddresses);

    while (idx < contractAddresses.length) {
      const options = {
        contractAddresses: contractAddresses.slice(idx, idx+config.web3.alchemy.maxContractsPerCall),
        omitMetadata: true,
      };

      console.log(`ALCHEMY: start: ${idx} -> ${config.web3.alchemy.maxContractsPerCall}`, options);
      promises.push(alchemy.nft.getNftsForOwner(address, options));

      idx += config.web3.alchemy.maxContractsPerCall;
    }

    let erc20 = [];
    let nfts = [];
    const responses = await Promise.all(promises);

    responses.forEach((resp, index) => {
      console.log('resp', resp);
      if (resp) {
        nfts = nfts.concat(resp?.ownedNfts || []);
      }
    });

    const alchemyTiming = performance.now() - startTime;
    console.log(`ALCHEMY TIMING ${alchemyTiming} ms`);

    console.log("NFTs are: ", nfts);

    startTime = performance.now();

    // Get all ERC721 tokens
    let erc721Assets = await getErc721ListFromAlchemy(nfts, address);
    if (erc721Assets === false) {
      // TODO: don't crap out??? other notifications?
      // return false;
      erc721Assets = [];
    }

    // Get all ERC20 tokens
/*     let erc20Assets = await getErc20ListFromAlchemy(erc20, address);
    if (erc20Assets === false) {
      // TODO: don't crap out??? other notifications?
      // return false;
      erc20Assets = [];
    } */

    //const allAssets = erc721Assets.concat(erc1155Assets).concat(erc20Assets);

    const procTiming = performance.now() - startTime;
    console.log(`PROC TIMING ${procTiming} ms`);

    return {
      chain,
      data: nfts,
      timing: { alchemyTiming, settings, nfts },
      //data: erc721Assets.concat(erc1155Assets),
      //data: erc721Assets,
      //currencies: erc20Assets,
    };
  } catch (e) {
    errorService.stashInternalErrorFromException(e, 'Svc:Alchemy:getWalletContents: ');

    return false;
  }
}

/**
 * Transform ERC721 results from alchemy into the format the games need.
 */
async function getErc721ListFromAlchemy(nfts, wallet) {
  try {
    let erc721GameAssets = [];
    let output721 = [];

    if (!nfts?.length) {
      return output721;
    }

    for (const erc721Token of nfts) {
      const contractAddress = erc721Token.contract.address;
      const erc721Asset = await assetService.getNftAssetByAddress(contractAddress);

      if (!erc721Asset) {
        // TODO???
        console.log(`asset not found for address ${contractAddress}`);
        continue;
      }
      if (erc721Asset.tokenType.toLowerCase() !== 'erc721') {
        // console.log(`asset not ERC721 ${contractAddress}`);
        continue;
      }

      console.log(`ALCHEMY: ERC721 found: ${contractAddress} - ${erc721Token.tokenId}`);

      // the *proper* way to get internal token id is to call the getter on the smart contract
      // BUT this takes time - something like 100ms to connect to contract and make call
      // this is unacceptable as users get more and more NFTs - so we do the hacky thing
      // of usingin knowledge of the custom token bitfield layout and do the extraction
      // using bitfield operators - much much faster

      /****
      const startTime = performance.now();
      const GMGAssetContract = new ethers.Contract(contractAddress, gmgAsset.abi, provider);
      const internalTokenId2 = await GMGAssetContract.getInternalTokenIdFromCustomTokenId(erc721Token.tokenId);
      const procTiming = performance.now() - startTime;

      console.log(`...INTERNAL TOKEN ID: ${internalTokenId.toNumber()} --- ${internalTokenId2.toNumber()} - ${procTiming} ms`);
      ****/

      const internalTokenId = getInternalTokenIdFromCustomTokenId(erc721Token.tokenId);
      const bn = ethers.BigNumber.from(erc721Token.tokenId);

      console.log(`...INTERNAL TOKEN ID: ${internalTokenId.toNumber()}`);

      for (const gameAsset of erc721Asset.dataValues.gameData) {
        //if (gameAsset.gameId === gameId && internalTokenId == gameAsset.tokenId) {
        erc721GameAssets.push({
          assetId: gameAsset.assetId,
          tmItemId: gameAsset.tmItemId || null,
          internalTokenId: gameAsset.tokenId,
          token: {
            type: 'erc721',
            wallet,
            analyticId: `${contractAddress}:${bn.toHexString()}`,
            smartContractId: contractAddress,
            internalTokenId: gameAsset.tokenId,
            // NB force customTokenId to a string for consistency
            customTokenId: String(erc721Token.tokenId),
          }
        });
        //}
      }

      output721 = Object.values(erc721GameAssets.reduce((acc, curr) => {
        const key = `${curr.assetId}-${curr.internalTokenId}`;
        if (acc[key]) {
          acc[key].tokens.push(curr.token);
        } else {
          acc[key] = {
            type: 'asset',
            assetId: curr.assetId,
            tmItemId: curr.tmItemId || null,
            internalTokenId: curr.internalTokenId,
            tokens: [curr.token]
          };
        }
        return acc;
      }, {}));
    }

    return output721;
  } catch (e) {
    errorService.stashInternalErrorFromException(e, 'Svc:Wallet:getErc721ListFromAlchemy: ');

/*     Bugsnag.notify(e, event => {
      event.context = 'Alchemy:: Get 721';
      event.addMetadata('payload', {gameId, results});
    });

    slackWebhook.send({
      text: 'ALCHEMY 721 ERROR - check bugsnag'
    }); */

    return false;
  }
}


/**
 * Transform ERC1155 results from Alchemy into the format the games need.
 */
async function getErc1155ListFromAlchemy(gameId, nfts, wallet) {
  try {
    let erc1155GameAssets = [];
    let output1155 = [];

    if (!nfts?.length) {
      return output1155;
    }

    for (const erc1155Token of nfts) {
      const contractAddress = erc1155Token.contract.address;
      const erc1155Asset = await assetService.getNftAssetByAddress(contractAddress);

      if (!erc1155Asset) {
        // TODO???
        console.log(`asset not found for address ${contractAddress}`);
        continue;
      }
      if (erc1155Asset.tokenType.toLowerCase() !== 'erc1155') {
        // console.log(`asset not ERC1155 ${contractAddress}`);
        continue;
      }

      let bn2SmartContractAddress = ethers.BigNumber.from(contractAddress);

      for (const gameAsset of erc1155Asset.dataValues.gameData) {
        if (gameAsset.gameId === gameId && parseInt(erc1155Token.tokenId) === gameAsset.tokenId) {
          erc1155GameAssets.push({
            assetId: gameAsset.assetId,
            tmItemId: gameAsset.tmItemId || null,
            internalTokenId: gameAsset.tokenId,
            token: {
              type: 'erc1155',
              wallet,
              analyticId: `${bn2SmartContractAddress.toHexString()}:${gameAsset.tokenId}`,
              smartContractId: contractAddress,
              internalTokenId: gameAsset.tokenId,
              // NB force customTokenId to a string for consistency
              customTokenId: String(erc1155Token.tokenId),
              value: erc1155Token.balance,
            }
          });
        }
      }

      output1155 = Object.values(erc1155GameAssets.reduce((acc, curr) => {
        const key = `${curr.assetId}-${curr.internalTokenId}`;
        if (acc[key]) {
          acc[key].tokens.push(curr.token);
        } else {
          acc[key] = {
            type: 'asset',
            assetId: curr.assetId,
            tmItemId: curr.tmItemId || null,
            internalTokenId: curr.internalTokenId,
            tokens: [curr.token]
          };
        }
        return acc;
      }, {}));
    }

    return output1155;
  } catch (e) {
    errorService.stashInternalErrorFromException(e, 'Svc:Wallet:getErc155ListFromAlchemy: ');

/*     Bugsnag.notify(e, event => {
      event.context = 'Alchemy:: Get 1155';
      event.addMetadata('payload', {gameId, results});
    });

    slackWebhook.send({
      text: 'ALCHEMY 1155 ERROR - check bugsnag'
    }); */

    return false;
  }
}

/**
 * Transform ERC20 results from Alchemy into the format the games need.
 */
async function getErc20ListFromAlchemy(erc20s, wallet) {
  // console.log('Svc:Alchemy:getErc20ListFromAlchemy', wallet, erc20s);

  try {
    let output20 = [];

    if (!erc20s?.length) {
      return output20;
    }

    for (const erc20Token of erc20s) {
      const contractAddress = erc20Token.contractAddress;
      const asset = await assetService.getErc20AssetByAddress(contractAddress);

      if (!asset) {
        // TODO???
        console.log(`ERC20 asset not found for address ${contractAddress}`);
        continue;
      }

      output20.push({
        type: "erc20",
        wallet,
        analyticId: `token-${contractAddress}`,
        smartContractId: contractAddress,
        balance: ethers.BigNumber.from(erc20Token.tokenBalance).toString(),
        balanceFmt: web3Service.getTokenBalanceFmt(erc20Token.tokenBalance, asset.decimals === null ? 18 : asset.decimals),
        name: asset.name,
        symbol: asset.symbol,
      });
    }

    return output20;
  } catch (e) {
    errorService.stashInternalErrorFromException(e, 'Svc:Wallet:getErc20ListFromAlchemy: ');
    return false;
  }
}
