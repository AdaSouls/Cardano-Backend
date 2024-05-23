const Sequelize = require('sequelize');
const config = require('../config/config');
const models = require("../model");

module.exports = function (sequelize) {

  const { fn, col, DataTypes, Model, Op } = Sequelize;

  class Collection extends Model {
    toSanitisedJson() {
      let resp = {
        collectionId: this.collectionId,
        name: this.name,
        smartContract: this.smartContract,
        policy: this.policy,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
      return resp;
    };
  }

  Collection.init({
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
    collectionId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    smartContract: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    policy: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  }, {
    sequelize,
    schema: config.postgresql.schema,
    tableName: 'collections',
    indexes: [
      {
        name: 'collections_collectionId',
        unique: true,
        fields: ['collectionId'],
      },
    ],
  });

  Collection.associate = (models) => {
    Collection.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  return Collection;
};
