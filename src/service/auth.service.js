const config = require('../config/config');
const errorService = require('./error.service');
const jwt = require("jsonwebtoken");

/**
 * Generate a JWT for a logged in user
 */
function generateJwt(userId) {
  try {
    const token = jwt.sign({ id: userId }, config.jwt.customSecret, {
      algorithm: "HS256",
      allowInsecureKeySizes: true,
      expiresIn: 86400, // 24 hours
    });

    return token;

  } catch (e) {
    console.log(e.message);
    errorService.stashInternalErrorFromException(e, 'Svc:Auth:generateJwt: ');
    return false;
  }
}

module.exports = {
  generateJwt,
};
