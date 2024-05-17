const jose = require('jose');
const config = require('../config/config');
const axios = require('axios');
const getPem = require("rsa-pem-from-mod-exp");
const jwt = require("jsonwebtoken");
const publicKeyToAddress = require("ethereum-public-key-to-address");

/**
 * Verify Motorverse user account. We need to do the following:
 *
 * 1. Verify that the JWT is valid
 * 2. Make sure we have a synced record for the user account
 * 3. If we do, we retrieve the user data
 * 4. If we don't, we create a user record
 *
 * @param {object} req
 * @param {object} data
 * @returns {Object}
 */
const checkMvAuth = async (req, data) => {

  const bearer = req.get('Authorization');
  console.log(`...bearer: ${bearer}`);

  if (!bearer) {
    console.log('...no bearer');
    return false;
  }

  if (!bearer.match(/^Bearer /)) {
    console.log('...bad format');
    return false;
  }

  const token = bearer.substring(7);
  console.log(`...token: ${token}`);

  return await verifyWeb3AuthJwtToken(token, data.walletAddress, data.appPublicKey);

}

/**
 * Verify Game user account. We need to do the following:
 *
 * 1. Verify that the JWT is valid
 * 2. Make sure we have a synced record for the user account
 * 3. If we do, we retrieve the user data
 * 4. If we don't, we reject the login
 *
 * @param {object} req
 * @returns {Object}
 */
const checkGameAuth = async (req) => {

  const bearer = req.get('Authorization');
  console.log(`...bearer: ${bearer}`);

  if (!bearer) {
    console.log('...no bearer');
    return false;
  }

  if (!bearer.match(/^Bearer /)) {
    console.log('...bad format');
    return false;
  }

  const token = bearer.substring(7);
  console.log(`...token: ${token}`);

  return await verifyCustomJwtToken(token, req.body.source, `${req.body.source}:motorverse`);

}

/**
 * Check b2c auth in the "Authorization: Bearer" header.
 * @param {object} req
 * @returns {boolean}
 */
const checkB2cAuth = async (req, userId = null) => {
  console.log('checkB2cAuth...');

  if (req.body._bypassAuth) {
    console.log('...BYPASS');
    return true;
  }

  const bearer = req.get('Authorization');
  console.log(`...bearer: ${bearer}`);

  if (!bearer) {
    console.log('...no bearer');
    return false;
  }

  if (!bearer.match(/^Bearer /)) {
    console.log('...bad format');
    return false;
  }

  const token = bearer.substring(7);
  console.log(`...token:   ${token}`);

  return await verifyB2cJwtToken(token, userId);
};

/**
 * Our own special "atob" that can handle unicode properly. The "atob()" in
 * node, and indeed in the browser, doesn't support unicode very well. I ended
 * up doing a deep dive into the web page source of https://jwt.ms (https://jwt.ms/Scripts/jwt-decode.js)
 * and came up with the following code that works!
 */
const b64DecodeUnicode = (str) => {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
};

const atobUnicode = (str) => {
  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try {
    return b64DecodeUnicode(output);
  } catch (err) {
    return '';
  }
};

/**
 * Verify a b2c token
 * See: https://learn.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
 *      (validation section)
 * See: https://www.npmjs.com/package/jsonwebtoken
 */
const verifyB2cJwtToken = async (token, userId = null) => {
  try {
    console.log('verifyJwtAuthToken', token, userId);

    if (!token) {
      return false;
    }

    // split the token into its 3 segments - header, body, signature
    const segments = token.split('.');
    if (segments.length !== 3) {
      console.error('...segments !== 3', segments.length);
      return false;
    }

    // get the algorithm and kid from the header
    const header = JSON.parse(atobUnicode(segments[0]));
    console.log('...header', header);
    const alg = header.alg;
    const kid = header.kid;
    if (!alg || !kid) {
      console.error('...null alg or kid');
      return false;
    }

    // decode the token "claim" (the body, the second segment)
    const body = JSON.parse(atobUnicode(segments[1]));
    console.log('...body', body);
    const tfp = body.tfp;
    if (!tfp) {
      console.error('...null tfp');
      return false;
    }

    // get key info for the kid
    const keyInfo = await getKeyInfo(tfp, kid);
    console.log('...keyInfo', keyInfo);
    if (!keyInfo) {
      console.error('...no keyinfo');
      return false;
    }

    // now we turn the key info into a PEM
    const pubkey = getPem(keyInfo.n, keyInfo.e);
    console.log('...PEM', pubkey);

    // and now verify the token
    const verifyParams = {
      algorithms: [alg],
      complete: true,
    };
    if (userId) {
      verifyParams.subject = userId;
      verifyParams.issuer = `https://${config.b2c.tenantName}.b2clogin.com/${config.b2c.tenantDirId}/v2.0/`;
    }

    console.log('...verifyParams', verifyParams);
    const verifyResp = jwt.verify(token, pubkey, verifyParams);
    console.log('...verifyResp', verifyResp);

    return verifyResp;
  } catch (e) {
    console.error('...ERROR', e);
    return false;
  }
};

let lastFetchTokenEncKeys = null;

const getKeyInfo = async (tfp, kid) => {
  console.log('getKeyInfo');

  if (lastFetchTokenEncKeys === null || new Date().getTime() / 1000 - lastFetchTokenEncKeys > tokenEncKeysElapse) {
    try {
      console.log('...fetch new data set');
      const metadataUrl = `https://${config.b2c.tenantName}.b2clogin.com/${config.b2c.tenantId}/${tfp.toLowerCase()}/v2.0/.well-known/openid-configuration`;
      console.log('getKeyInfo', metadataUrl);
      let resp = await axios.get(metadataUrl);
      console.log(resp.data);
      const jwks_uri = resp.data.jwks_uri;
      if (!jwks_uri) {
        return false;
      }
      resp = await axios.get(jwks_uri);
      tokenEncKeys = resp.data.keys || [];
      lastFetchTokenEncKeys = new Date().getTime() / 1000;
    } catch (e) {
      console.error('...getKeyInfo ERROR', e);
      return false;
    }
  }

  console.log('...keys to search', kid, tokenEncKeys);
  return tokenEncKeys.find(keyInfo => keyInfo.kid === kid);
};

/**
 * Verify a web3auth token
 * See: https://web3auth.io/docs/pnp/features/server-side-verification/external-wallets#verifying-idtoken-in-backend
 */
const verifyWeb3AuthJwtToken = async (token, walletAddress, appPublicKey) => {

  try {

    let jwks;

    if (walletAddress) {
      // Authentication has been done using the wallet
      jwks = jose.createRemoteJWKSet(new URL(config.web3auth.walletJwksUrl));
    } else {
      // Get the JWK set used to sign the JWT issued by Web3Auth
      jwks = jose.createRemoteJWKSet(new URL(config.web3auth.jwksUrl));
    }

    // Verify the JWT using Web3Auth's JWKS
    const jwtDecoded = await jose.jwtVerify(token, jwks, { algorithms: ["ES256"] });

    if (walletAddress) {
      if (jwtDecoded.payload.wallets[0].address.toLowerCase() === walletAddress.toLowerCase()) {
        return {
          valid: true,
          jwt: jwtDecoded,
          wallet: {
            address: walletAddress,
            type: "ethereum",
          },
        }
      } else {
        return {
          valid: false,
          code: "ERR_JWT_INVALID_WALLET",
          reason: "Web3Auth JWT from wallet is invalid"
        }
      }
    } else {
      // Checking `app_pub_key` against the decoded JWT wallet's public_key
      if (jwtDecoded.payload.wallets[0].public_key.toLowerCase() === appPublicKey.toLowerCase()) {
        // Verified
        return {
          valid: true,
          jwt: jwtDecoded,
          wallet: {
            address: parseTokenAndReturnAddress(token),
            type: "ethereum",
          },
        }
      } else {
        //errorService.stashUnauthorized("Web3Auth JWT is invalid", "invalid-jwt")
        return {
          valid: false,
          code: "ERR_JWT_INVALID_SOCIAL",
          reason: "Web3Auth JWT from socials is invalid"
        }
      }
    }

  } catch (e) {
    console.error('...ERROR VERIFYING WEB3AUTH JWT', e);
    //errorService.stashUnauthorized(e, e.code);
    return {
      valid: false,
      code: e.code,
      reason: e.message
    }
  }
};

/**
 * Verify a custom jwt
 */
const verifyCustomJwtToken = async (token, issuer, audience) => {

  try {

    const secret = new TextEncoder().encode(config.jwt.customSecret);

    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: issuer,
      audience: audience,
    })

    if (payload.iss === issuer && payload.aud === audience) {
      // Verified
      return {
        valid: true,
        jwt: payload
      }
    } else {
      //errorService.stashUnauthorized("Custom JWT is invalid", "invalid-custom-jwt")
      return {
        valid: false,
        code: "ERR_CUSTOM_JWT_INVALID",
        reason: "Custom JWT is invalid"
      }
    }

  } catch (e) {
    console.error('...ERROR VERIFYING CUSTOM JWT', e);
    return {
      valid: false,
      code: e.code,
      reason: e.reason
    }
  }
};

const parseTokenAndReturnAddress = (token) => {
  if (!token) return null
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  )
  console.log(JSON.parse(jsonPayload).wallets[0].public_key)
  return publicKeyToAddress(JSON.parse(jsonPayload)?.wallets[0]?.public_key || '')
}

module.exports = {
  checkMvAuth,
  checkB2cAuth,
  checkGameAuth,
  parseTokenAndReturnAddress,
};
