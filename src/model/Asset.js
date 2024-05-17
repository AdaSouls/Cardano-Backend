const Sequelize = require('sequelize');
const config = require('../config/config');

module.exports = function(sequelize) {

  const { fn, DataTypes, Model } = Sequelize;

  class Asset extends Model {
    toSanitisedJson() {
      return {
        id: this.id,
        tokenType: this.tokenType,
        title: this.title,
        chain: this.chain,
        address: this.address,
        operatorAddress: this.operatorAddress,
        internalContractId: this.internalContractId,
        startBlock: this.startBlock,
        gameData: this.gameData,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    };
  }

  Asset.init(
    {
      // add our own createdAt/updatedAt definitions to put them at the start of the table
      // (after id), as postgres doesn't allow columns to be added in nominated positions,
      // so as we add new columns into the future, it's annoying to see them in raw table views
      // come after the timestamp fields - ocd?
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: fn('NOW'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: fn('NOW'),
      },
      tokenType: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      chain: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      operatorAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      internalContractId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      startBlock: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      gameData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    }, {
      sequelize,
      schema: config.postgresql.schema,
      tableName: 'assets',
      indexes: [
        {
          unique: true,
          fields: ['address'],
        },
      ],
    }
  );

  return Asset;
};
