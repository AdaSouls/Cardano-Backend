const Joi = require('joi');
const { address, chain, tokenType } = require('./custom.validation');

/*
|--------------------------------------------------------------------------
| Admin.
|--------------------------------------------------------------------------
*/

const addRoleToUser = {
  params: {
    address: Joi.string().required().custom(address),
  },
};

/*
|--------------------------------------------------------------------------
| Exports.
|--------------------------------------------------------------------------
*/

module.exports = {
  addRoleToUser,
};
