const Sequelize = require('sequelize');
const config = require('../config/config');
const models = require("../model");

module.exports = function (sequelize) {

  const { fn, col, DataTypes, Model, Op } = Sequelize;

  class User extends Model {
    toSanitisedJson() {
      let resp = {
        userId: this.userId,
        email: this.email,
        name: this.name,
        wallet: this.wallet,
        roles: this.roles,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
      return resp;
    };
  }

  User.init({
    // add our own createdAt/UpdatedAt definitions to put them at the start of the table
    // (after id), as postgres doesn't allow columns to be added in nominated positions,
    // so as we add new columns into the future, it's annoying to see them in raw table views
    // come after the timestamp fields - ocd?
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    wallet: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  }, {
    sequelize,
    schema: config.postgresql.schema,
    tableName: 'users',
    indexes: [
      {
        name: 'users_userid',
        unique: true,
        fields: ['userId'],
      },
      // it seems counter-intuitive to not make email unique, but we don't have to worry as b2c enforces
      // it, and we could have a situation where an entry in our database no longer exists on b2c etc etc
      {
        name: 'users_email',
        unique: true,
        fields: [fn('lower', col('email'))],
      },
      {
        name: 'users_name',
        unique: false,
        fields: [fn('lower', col('name'))],
      },
    ],
  });

  return User;
};
