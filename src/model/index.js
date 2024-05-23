const { sequelize } = require('../database/connection');

const models = {
  Collection: require('./Collection')(sequelize),
  Soulbound: require('./Soulbound')(sequelize),
  User: require('./User')(sequelize),
};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});

module.exports = models;
