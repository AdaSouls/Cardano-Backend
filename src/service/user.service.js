const models = require('../model');
const authService = require('./auth.service');
const errorService = require('./error.service');
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

module.exports = {
  userLogin,
};
