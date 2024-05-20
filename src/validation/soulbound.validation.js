const Joi = require('joi');
const { filterByType } = require('./custom.validation');

const getAllSoulbound = {
  body: Joi.object().keys({
    filterBy: Joi.string().optional().allow(null).custom(filterByType),
  }),
};

const getSoulbound = {
  body: Joi.object().keys({
    filterBy: Joi.string().optional().allow(null).custom(filterByType),
  }),
};

module.exports = {
  getAllSoulbound,
  getSoulbound,
};
