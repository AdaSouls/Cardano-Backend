const models = require('../model');
const authService = require('./auth.service');
const errorService = require('./error.service');
const config = require('../config/config');
const dicewareWord = require('diceware-word');
const { Op } = require('sequelize');
const { Buffer } = require("buffer");
const { COSESign1, COSEKey, BigNum, Label, Int } = require("@emurgo/cardano-message-signing-nodejs");
const { Ed25519Signature, RewardAddress, PublicKey, Address, BaseAddress } = require("@emurgo/cardano-serialization-lib-nodejs");

/**
 * Authenticate a user using a signed message by a Cardano wallet.
 *
 * @param {Object} signedData
 * @returns {Object}
 */
const userLogin = async (signedData, email = null, username = null) => {

  try {
    const decoded = COSESign1.from_bytes( Buffer.from(signedData.signature, "hex") );
    const headermap = decoded.headers().protected().deserialized_headers();
    const addressHex = Buffer.from( headermap.header( Label.new_text("address") ).to_bytes() )
        .toString("hex")
        .substring(4);
    const address = Address.from_bytes( Buffer.from(addressHex, "hex") );
    const baseAddress = BaseAddress.from_address(address);
    const stakeCred = baseAddress.stake_cred();
    const rewardAddressBytes = new Uint8Array(29);
    rewardAddressBytes.set([0xe1], 0);
    rewardAddressBytes.set(stakeCred.to_bytes().slice(4, 32), 1);

    const key = COSEKey.from_bytes( Buffer.from(signedData.key, "hex") );
    const pubKeyBytes = key.header( Label.new_int( Int.new_negative(BigNum.from_str("2")) ) ).as_bytes();
    const publicKey = PublicKey.from_bytes(pubKeyBytes);

    const payload = decoded.payload();
    const signature = Ed25519Signature.from_bytes(decoded.signature());
    const receivedData = decoded.signed_data().to_bytes();

    //const signerStakeAddrBech32 = RewardAddress.from_address(address).to_address().to_bech32();
    const signerStakeAddrBech32 = RewardAddress.from_address(Address.from_bytes(rewardAddressBytes)).to_address().to_bech32();

    const utf8Payload = Buffer.from(payload).toString("utf8");
    const expectedPayload = `account: ${signerStakeAddrBech32}`; // reconstructed message

    // verify:
    const isVerified = publicKey.verify(receivedData, signature);
    const payloadAsExpected = utf8Payload == expectedPayload;
    //const signerIsRegistered = registeredUsers.includes(signerStakeAddrBech32);

    //const isAuthSuccess = isVerified && payloadAsExpected && signerIsRegistered;
    const isAuthSuccess = isVerified && payloadAsExpected;

    if(isAuthSuccess) {
      // The wallet authentication is valid, I have to get a user from the users db
      let user = await getUserByStakeAddress(signerStakeAddrBech32);

      if (!user) {
        // The user is new, add user to database
        const userPayload = {
          email: email == null ? "" : email,
          username: username == null ? "" : username,
          wallet: {
            type: "cardano",
            address: baseAddress.to_address().to_bech32(),
          },
          stakeAddress: signerStakeAddrBech32,
          roles: [],
        };

        user = await models.User.create(userPayload);

        if (!user) {
          console.log('...error creating new user');
          errorService.stashNotFound('Error creating new user in database', 'db-error');
          return false;
        }
      }

      // I have an user, I retrieve a valid JWT for the session
      const token = authService.generateJwt(user.userId);

      if (!token) {
        return {
          token: "jwt generation failed"
        };
      }

      return {
        user: user,
        token
      }

    } else {
      // The cardano wallet authentication failed
      return {
        token: "signature failed"
      };
    }
  } catch (error) {
    console.log("Svc:Users:userLogin error", error);
    errorService.stashInternalErrorFromException(error, "Svc:Users:userLogin: ");
    return false;
  }
};

/**
 * Get user by cardano stake address.
 *
 * @param {string} stakeAddress
 * @returns {Object}
 */
const getUserByStakeAddress = async (stakeAddress) => {
  let user = await models.User.findOne({ where: { stakeAddress: stakeAddress.toLowerCase() }});
  return user;
};

/**
 * Get user by userId.
 *
 * @param {string} userId
 * @returns {Object}
 */
const getUserById = async (userId) => {
  let user = await models.User.findOne({ where: { userId: userId.toLowerCase() }});
  return user;
};

/**
 * Get user motorverse wallet by userId.
 *
 * @param {string} userId
 * @returns {Object}
 */
const getUserMvWalletById = async (userId) => {
  let user = await models.User.findOne({ where: { userId: userId.toLowerCase() }});
  if (!user) {
    console.log('....error fetching user!');
    errorService.stashNotFound('User wallet not found', 'not-found');
    return false;
  }
  return user.wallet.mv.address;
};

/**
 * Get user by external wallet.
 *
 * @param {string} wallet
 * @returns {Object}
 */
const getUserByMotorverseOrExternalWallet = async (wallet) => {

  let user = await models.User.findOne({
    where: {
      wallet: {
        [Op.or]: [
          {
            "mv": {
              type: "ethereum",
              address: wallet
            }
          },
          {
            "external": {
              type: "ethereum",
              address: wallet
            }
          },
        ]
      }
    }
  })

  if (!user) {
    console.log('....error fetching user!');
    errorService.stashNotFound('User wallet not found', 'wallet-not-found');
    return false;
  }

  return user;
};

/**
 * Get user stakes by userId.
 *
 * @param {string} userId
 * @returns {Object}
 */
const getUserStakesByUserId = async (userId) => {
  let stakes = await models.Stake.findAll({ where: { userId: userId }});
  return stakes;
};

/**
 * Get user stakes by userId.
 *
 * @param {string} userId
 * @returns {Object}
 */
const getUserPointsByUserId = async (userId) => {
  let pointsHistory = await models.PointsHistory.findAll({ where: { userId: userId }});
  return pointsHistory;
};

/**
 * Get user leaderboard
 *
 * @returns {Object}
 */
const getUserLeaderboardFromTable = async () => {
  let leaderboard = await models.User.findAll({ where: {
    points: { [Op.gt]: 0 }
  },
  order: [
    ['points', 'DESC']
  ],
  attributes: ['id', 'wallet', 'points']},
  );
  console.log(leaderboard);
  return leaderboard;
};

/**
 * Update an user's stake to 'withdrawn' status.
 *
 * @param {string} wallet
 * @param {string} withdrawTransactionHash
 * @param {Number} poolIndex
 * @param {Number} depositIndex
 * @param {string} amount
 * @param {string} withdrawEventDate
 * @returns {Object}
 */
const updateUserStake = async (wallet, withdrawTransactionHash, poolIndex, depositIndex, amount, withdrawEventDate) => {
  let [number, stakes] = await models.Stake.update({
    withdrawTransactionHash: withdrawTransactionHash,
    withdrawEventDate: withdrawEventDate,
    status: "withdrawn"
  },
    { where: {
    walletAddress: wallet,
    poolIndex: poolIndex,
    depositIndex: depositIndex,
    amount: amount
  }, returning: true });

  return { number, stakes };
};

/**
 * Generate OTP for a particular game. We need to do the following:
 *
 * 1. Verify that the userId is valid
 * 2. Create a passphrase against that game (expiring in 1 hour from now)
 * 3. Save record to OTP dabatase
 * 4. Retrieve passphrase
 *
 * @param {string} userId
 * @param {object} data
 * @returns {Object}
 */
const generateOtpForGame = async (data, jwtDecoded) => {

  let user = await getUserByMvAuthKey(
    jwtDecoded.payload.wallets[0].public_key?.toLowerCase() ||
    jwtDecoded.payload.wallets[0].address?.toLowerCase()
  );

  if (!user) {
    console.log('....error fetching the user!');
    errorService.stashNotFound('User not found', 'not-found');
    return false;
  }

  const passphrase = await getUniquePassphrase();
  let today = new Date();

  const otpPayload = {
    userId: user.userId,
    gameId: data.gameId,
    otp: passphrase,
    expiresAt: today.setHours(today.getHours() + parseInt(config.otp.expiration))
  };

  let [otp, ] = await models.Otp.upsert(otpPayload);

  if (!otp) {
    console.log('....error creating new otp!');
    errorService.stashNotFound('Otp not found', 'not-found');
    return false;
  }

  return otp;

}

/**
 * Generate OTP for a particular game. We need to do the following:
 *
 * 1. Verify that the userId is valid
 * 2. Check the OTP database for a match (consider the expiration date)
 * 3. If OTP is valid, link the game to the user account
 * 4. If the OTP is invalid, reject the operation
 *
 * @param {string} userId
 * @returns {Object}
 */
const linkGameToUser = async (data) => {

  let now = new Date();

  let otp = await models.Otp.findOne({ where: {
      gameId: data.gameId,
      otp: data.otp,
    }
  });

  if (otp.expiresAt < now) {
    console.log('....otp has expired!');
    errorService.stashNotFound('Otp expired', 'otp-expired');
    return false;
  }

  if (!otp) {
    console.log('....error fetching the otp!');
    errorService.stashNotFound('Otp not found', 'not-found');
    return false;
  }

  // OTP is valid
  let user = await getUserById(otp.userId);

  if (!user) {
    console.log('....error fetching the user!');
    errorService.stashNotFound('User not found', 'not-found');
    return false;
  }

  // Link game to user
  user.linkedGames[data.gameId] = data.userAuth,
  user.changed("linkedGames", true);
  await user.save();

  return user;

}

/**
 * Links an external wallet to a user
 *
 * @param {object} data
 * @returns {Object}
 */
const linkExternalWallet = async (data, jwtDecoded) => {

  let user;

  // Try to get the user from the database
  if (data.source === "mv") {

    // Check if that wallet already exists for another user
    user = await getUserByMotorverseOrExternalWallet(data.externalWallet.address.toLowerCase());

    if (user) {
      console.log('....error linking external wallet to user!');
      errorService.stashNotFound('Wallet already linked to another user', 'wallet-linked');
      return false;
    }

    // The verification comes from the motorverse hub
    user = await getUserByMvAuthKey(
      jwtDecoded.payload.wallets[0].public_key?.toLowerCase() ||
      jwtDecoded.payload.wallets[0].address?.toLowerCase()
      );

    if (!user) {
      console.log('....error fetching the user!');
      errorService.stashNotFound('User not found', 'not-found');
      return false;
    }

    // Link wallet to user
    data.externalWallet.address = data.externalWallet.address.toLowerCase();
    user.wallet.external = data.externalWallet;
    user.changed("wallet", true);
    await user.save();
    return user;
  } else {
    // The case to link game wallets to users is handled in the linkGameWallet endpoint
    return false;
  }

}

/**
 *  Unlinks an external wallet from a user
 *
 */
const unlinkExternalWallet = async (data, jwtDecoded) => {

  let user;

  // Try to get the user from the database
  if (data.source === "mv") {
    // The verification comes from the motorverse hub
    user = await getUserByMvAuthKey(
      jwtDecoded.payload.wallets[0].public_key?.toLowerCase() ||
      jwtDecoded.payload.wallets[0].address?.toLowerCase()
      );

    if (!user) {
      console.log('....error fetching the user!');
      errorService.stashNotFound('User not found', 'not-found');
      return false;
    }

    // Unlink wallet to user
    delete user.wallet.external;
    user.changed("wallet", true);
    await user.save();
    return user;
  } else {
    // The case to unlink game wallets from users is handled in the unlinkGameWallet endpoint
    return false;
  }

}

/**
 * Links a game wallet to a user
 *
 * @param {object} data
 * @returns {Object}
 */
const linkGameWallet = async (data, jwtDecoded) => {

  let user;

  user = await models.User.findOne({
    where: {
      linkedGames: {
        [data.source]: {
          userId: jwtDecoded.sub
        }
      }
    }
  })

  if (!user) {
    console.log(`....error fetching the user for game ${data.source}!`);
    errorService.stashNotFound('User not found for game', 'not-found');
    return false;
  }

  // Link wallet to user
  user.linkedGames[data.source].wallet = data.gameWallet,
  user.changed("linkedGames", true);
  await user.save();
  return user;

}

/**
 *  Unlinks a game wallet from a user
 *
 */
const unlinkGameWallet = async (data, jwtDecoded) => {

  let user;

  user = await models.User.findOne({
    where: {
      linkedGames: {
        [data.source]: {
          userId: jwtDecoded.sub
        }
      }
    }
  })

  if (!user) {
    console.log(`....error fetching the user for game ${data.source}!`);
    errorService.stashNotFound('User not found for game', 'not-found');
    return false;
  }

  // Unlink wallet to user
  delete user.linkedGames[data.source].wallet;
  user.changed("linkedGames", true);
  await user.save();
  return user;

}

const getUniquePassphrase = async () => {
  let passphrase;
  let words = [];
  for (let j = 0; j < 3; j++) {
    words.push(dicewareWord());
  }
  passphrase = words.join(' ').toLowerCase();

  return passphrase;

};

module.exports = {
  userLogin,
  generateOtpForGame,
  linkGameToUser,
  linkExternalWallet,
  unlinkExternalWallet,
  linkGameWallet,
  unlinkGameWallet,
  getUserMvWalletById,
  getUserByMotorverseOrExternalWallet,
  updateUserStake,
};
