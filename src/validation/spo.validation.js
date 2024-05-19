const Joi = require('joi');
const { filterByType } = require('./custom.validation');

const getAllSpo = {
  body: Joi.object().keys({
    filterBy: Joi.string().optional().allow(null).custom(filterByType),
  }),
};

module.exports = {
  getAllSpo,
};
