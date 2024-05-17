const models = require('../model');
const errorService = require('./error.service');
const certService = require('./cert.service');
const config = require('../config/config');
const dicewareWord = require('diceware-word');
const jose = require('jose');
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { Op } = require('sequelize');

/**
 * Get user by mvAuthKey.
 *
 * @param {string} mvAuthKey
 * @returns {Object}
 */
const getUserByMvAuthKey = async (mvAuthKey) => {
  let user = await models.User.findOne({ where: { mvAuthKey: mvAuthKey.toLowerCase() }});
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
 * Verify user account depending on the source. We need to do the following:
 *
 * 1. Make sure we have a synced record for the user account.
 * 2. If we do, we retrieve the user data
 * 3. If we don't, we create a user record
 *
 * @param {object} data
 * @returns {Object}
 */
const verifyAccount = async (data, jwtDecoded, wallet = null) => {

  let user;

  if (wallet) {
    wallet.address = wallet.address.toLowerCase();
  }

  // Try to get the user from the database
  if (data.source === "mv") {
    // The verification comes from the motorverse hub
    user = await getUserByMvAuthKey(
      jwtDecoded.payload.wallets[0].public_key?.toLowerCase() ||
      jwtDecoded.payload.wallets[0].address?.toLowerCase()
      );

    if (!user) {

      // No user by key, let's try by wallet:
      if (wallet) {
        user = await getUserByMotorverseOrExternalWallet(wallet.address)
        console.log(user);

        if (user) {
          console.log('....error creating new user!');
          errorService.stashNotFound('Wallet linked to another user', 'wallet-linked');
          return false;
        }
      }

      const userPayload = {
        mvAuthKey: jwtDecoded.payload.wallets[0].public_key?.toLowerCase() || jwtDecoded.payload.wallets[0].address?.toLowerCase(),
        mvAuthType: jwtDecoded.payload.verifier || "wallet",
        email: jwtDecoded.payload.email || "",
        name: jwtDecoded.payload.name || "",
        smartWallet: null,
        embeddedWallet: null,
        wallet: {
          mv: wallet,
        },
        linkedGames: {},
      };

      user = await models.User.create(userPayload);

      if (!user) {
        console.log('....error creating new user!');
        errorService.stashNotFound('User not found', 'not-found');
        return false;
      }
    }
  } else {
    // The verification comes from the games
    // If this happens, I have to look for the session ID in the linkedGames JSONB field

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

  }

  return user;
}

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
const generateCustomJwt = async (body) => {

  const secret = new TextEncoder().encode(
    config.jwt.customSecret,
  )

  const alg = 'HS256'

  const jwt = await new jose.SignJWT(body)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(body.gameId)
    .setAudience(`${body.gameId}:motorverse`)
    .setExpirationTime('1h')
    .sign(secret)

  return jwt;

}

/**
 * Generate Mocaverse jwt.
 */
const generateMocaverseJwt = async (body) => {

  body.partnerId = config.moca.partnerId;

  let partnerPrivateKey;

  if (config.env === 'local') {
    partnerPrivateKey = fs.readFileSync(
      path.resolve(__dirname, '../certs/motorverse.key'),
      'utf8',
    );
  } else {
    // Get the private key from the certs table
    let cert = await certService.getCertByCertType("mocaverse");
    const decrypted = certService.decrypt(cert.value, config.moca.password);
    partnerPrivateKey = decrypted;
  }

  const token = jwt.sign(body, partnerPrivateKey, {
    expiresIn: '1h',
    algorithm: 'RS256',
  });

  return token;

}

/**
 * Adds points to a user:
 *
 * 1. Make sure we have a synced record for the user account.
 * 2. If we do, we add points to that user and retrieve the user data
 * 3. If we don't, we give an error
 *
 * @param {object} data
 * @returns {Object}
 */
const redeemUserPoints = async (data, jwtDecoded) => {

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
    } else {
      // User found, check amount of points
      let { pointsToRedeem } = data;

      if (user.dataValues.points < pointsToRedeem) {
        console.log('....amount of points to redeem is higher than actual points!');
        errorService.stashForbidden('Not enough points', 'not-enough-points');
        return false;
      } else {
        console.log("puntos para redeem: ", pointsToRedeem);
        console.log("puntos actuales: ", user.points);
        user.points = user.points - pointsToRedeem;
        console.log("nuevos puntos antes de grabar: ", user.points);
        console.log("tier antes de grabar: ", user.tier);
        await user.save();
        console.log("tier despues de grabar: ", user.tier);

        const pointsHistoryPayload = {
          eventType: "redeem",
          timeframe: 0,
          amountStaked: "0",
          campaignNumber: 1,
          points: pointsToRedeem,
          multipliers: {},
          pointsAwarded: -pointsToRedeem,
          userId: user.dataValues.id,
          status: "redeemed",
        }

        let newPointHistory = await models.PointsHistory.create(pointsHistoryPayload);

        if (!newPointHistory) {
          console.log('....error saving points history');
          errorService.stashNotFound('PointsHistory failed', 'failed');
          return false;
        }

      }
    }
  } else {
    console.log('....call only possible from the motorverse hub!');
    errorService.stashNotFound('Action not permitted', 'not-permitted');
    return false;
  }

  return user;
}

/**
 * Gets the history of points from a user:
 *
 * 1. Make sure we have a synced record for the user account.
 * 2. If we do, we add points to that user and retrieve the user data
 * 3. If we don't, we give an error
 *
 * @param {object} data
 * @returns {Object}
 */
const getUserPointsHistory = async (data, jwtDecoded) => {

  let user, pointsHistory;

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

    pointsHistory = await getUserPointsByUserId(user.dataValues.id);

  } else {
    console.log('....call only possible from the motorverse hub!');
    errorService.stashNotFound('Action not permitted', 'not-permitted');
    return false;
  }

  return pointsHistory;
}

/**
 * Gets points from a user:
 *
 * 1. Make sure we have a synced record for the user account.
 * 2. If we do, we add points to that user and retrieve the user data
 * 3. If we don't, we give an error
 *
 * @param {object} data
 * @returns {Object}
 */
const getUserPoints = async (data, jwtDecoded) => {

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

  } else {
    console.log('....call only possible from the motorverse hub!');
    errorService.stashNotFound('Action not permitted', 'not-permitted');
    return false;
  }

  return {
    id: user.dataValues.id,
    userId: user.dataValues.userId,
    mvAuthKey: user.dataValues.mvAuthKey,
    points: user.dataValues.points,
    tier: user.dataValues.tier,
  };
}

/**
 * Gets stakes from a user:
 *
 * 1. Make sure we have a synced record for the user account.
 * 2. If we do, we add points to that user and retrieve the user data
 * 3. If we don't, we give an error
 *
 * @param {object} data
 * @returns {Object}
 */
const getUserStakes = async (data, jwtDecoded) => {

  let user, stakes;

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

    stakes = await getUserStakesByUserId(user.dataValues.id);

  } else {
    console.log('....call only possible from the motorverse hub!');
    errorService.stashNotFound('Action not permitted', 'not-permitted');
    return false;
  }

  return stakes;
}

/**
 * Gets stakes from a user:
 *
 * 1. Make sure we have a synced record for the user account.
 * 2. If we do, we add points to that user and retrieve the user data
 * 3. If we don't, we give an error
 *
 * @param {object} data
 * @returns {Object}
 */
const getUserLeaderboard = async () => {

  let leaderboard = await getUserLeaderboardFromTable();

  return leaderboard;
}

module.exports = {
  verifyAccount,
  generateOtpForGame,
  linkGameToUser,
  linkExternalWallet,
  unlinkExternalWallet,
  linkGameWallet,
  unlinkGameWallet,
  getUserMvWalletById,
  getUserByMotorverseOrExternalWallet,
  generateCustomJwt,
  generateMocaverseJwt,
  redeemUserPoints,
  getUserPoints,
  getUserStakes,
  updateUserStake,
  getUserPointsHistory,
  getUserLeaderboard,
};
