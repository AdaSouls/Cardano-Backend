const { ethers } = require('ethers');
const config = require('../config/config');
const emailValidator = require("email-validator");

const mongodbObjectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const email = (value, helpers) => {
  if (!emailValidator.validate(value)) {
    return helpers.message('"{{#label}}" must be a valid email address');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('password must contain at least 1 letter and 1 number');
  }
  return value;
};

const address = (value, helpers) => {
  if (!ethers.utils.isAddress(value)) {
    return helpers.message('Invalid Ethereum address format');
  }
  return value;
};

const tokenType = (value, helpers) => {
  if (['erc20', 'erc721', 'erc1155'].indexOf(value.toLowerCase()) === -1) {
    return helpers.message('Invalid token type');
  }
  return value;
};

const chain = (value, helpers) => {
  if (!value && helpers.prefs.presence === 'optional') {
    return value;
  }
  if (config.web3.supportedChains.indexOf(value.toLowerCase()) === -1) {
    return helpers.message('Invalid chain');
  }
  return value;
};

const walletType = (value, helpers) => {
  if (!value && helpers.prefs.presence === 'optional') {
    return value;
  }
  if (["ethereum"].indexOf(value.toLowerCase()) === -1) {
    return helpers.message('Invalid wallet type');
  }
  return value;
};

module.exports = {
  mongodbObjectId,
  email,
  password,
  address,
  tokenType,
  chain,
  walletType,
};
