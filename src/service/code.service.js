const config = require('../config/config');

/**
 * Check a function code.
 * @param {object} req
 * @param {string} func
 * @returns {boolean}
 */
const checkCode = (req, func = null) => {
  if (req.query.code == config.functionCodes.master) {
    return true;
  }

  // just use master code now
  /***************
  if (config.functionCodes[func] && req.query.code !== config.functionCodes[func]) {
    errorService.stashUnauthorized();
    return false;
  }

  return true;
  ***************/

  return false;
};


module.exports = {
  checkCode,
};
