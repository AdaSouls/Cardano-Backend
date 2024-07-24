const Sequelize = require('sequelize');
const config = require('../config/config');
const models = require("../model");

module.exports = function (sequelize) {

  const { DataTypes, Model } = Sequelize;

  class Collection extends Model {
    toSanitisedJson() {
      let resp = {
        collectionId: this.collectionId,
        owner: this.owner,
        name: this.name,
        smartContract: this.smartContract,
        policyId: this.policyId,
        policyHash: this.policyHash,
        policy: this.policy,
        mint: this.mint,
        redeem: this.redeem,
        // tokens: this.tokens,
        invited: this.invited,
        aikenCourse: this.aikenCourse,
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
    owner: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    smartContract: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    policyId: {
      type: DataTypes.STRING(56),
      allowNull: false,
      unique: false,
    },
    policyHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: false,
    },
    policy: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    mint: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    redeem: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    // tokens: {
    //   type: DataTypes.ARRAY(DataTypes.INTEGER),
    //   defaultValue: [],
    // },
    invited: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    aikenCourse: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    }
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
    Collection.hasMany(models.Soulbound, {
      foreignKey: 'collectionId',
      sourceKey: 'collectionId',
      keyType: DataTypes.UUID,
      as: 'tokens'
    });
  };

  return Collection;
};
