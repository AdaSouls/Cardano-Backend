const Sequelize = require('sequelize');
const config = require('../config/config');
const models = require("../model");

module.exports = function (sequelize) {

  const { fn, col, DataTypes, Model, Op } = Sequelize;

  class Soulbound extends Model {
    toSanitisedJson() {
      let resp = {
        soulboundId: this.soulboundId,
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
      return resp;
    };
  }

  Soulbound.init({
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
    soulboundId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  }, {
    sequelize,
    schema: config.postgresql.schema,
    tableName: 'soulbounds',
    indexes: [
      {
        name: 'soulbounds_soulboundId',
        unique: true,
        fields: ['soulboundId'],
      },
    ],
  });

  Soulbound.associate = (models) => {
    Soulbound.belongsTo(models.Collection, {
      foreignKey: 'collectionId',
    });
  };

  return Soulbound;
};
