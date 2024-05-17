const models = require('../model');
const CryptoJS = require("crypto-js");

/**
 * Get cert by cert type.
 *
 * @param {string} certType
 * @returns {Object}
 */
const getCertByCertType = async (certType) => {
  let cert = await models.Cert.findOne({ where: { certType: certType.toLowerCase() }});
  return cert;
};

const decrypt = (cipherText, secret) => {
  var bytes = CryptoJS.AES.decrypt(cipherText, secret);
  var decrypted = bytes.toString(CryptoJS.enc.Utf8);

  return decrypted;
}

module.exports = {
  getCertByCertType,
  decrypt,
};
