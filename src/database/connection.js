const Sequelize = require('sequelize');
const config = require('../config/config');

let sequelize;

if (config.postgresql.url) {
  sequelize = new Sequelize(config.postgresql.url, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    }
  });
} else {
  sequelize = new Sequelize(
    config.postgresql.database,
    config.postgresql.user,
    config.postgresql.password,
    {
      dialect: 'postgres',
    }
  );
}

module.exports = {
  sequelize,
  Sequelize,
};
