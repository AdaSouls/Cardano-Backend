const { sequelize } = require('../database/connection');

const models = {
  Asset: require('./Asset')(sequelize),
  Otp: require('./Otp')(sequelize),
  User: require('./User')(sequelize),
};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});

module.exports = models;
