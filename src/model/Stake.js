const Sequelize = require('sequelize');
const config = require('../config/config');
const models = require("../model");

module.exports = function (sequelize) {

  const { DataTypes, Model } = Sequelize;

  class Stake extends Model {
    toSanitisedJson() {
      let resp = {
        stakeId: this.stakeId,
        chain: this.chain,
        walletAddress: this.walletAddress,
        smartContractAddress: this.smartContractAddress,
        stakingTransactionHash: this.stakingTransactionHash,
        withdrawTransactionHash: this.withdrawTransactionHash,
        stakingEventDate: this.stakingEventDate,
        withdrawEventDate: this.withdrawEventDate,
        lockPeriod: this.lockPeriod,
        amount: this.amount,
        poolIndex: this.poolIndex,
        depositIndex: this.depositIndex,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
      return resp;
    };
  }

  Stake.init({
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
    stakeId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      allowNull: false,
    },
    chain: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    walletAddress: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    smartContractAddress: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    stakingTransactionHash: {
      type: DataTypes.STRING(70),
      unique: true,
      allowNull: false,
    },
    withdrawTransactionHash: {
      type: DataTypes.STRING(70),
      unique: true,
      allowNull: true,
    },
    stakingEventDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    withdrawEventDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lockPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    poolIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    depositIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    sequelize,
    schema: config.postgresql.schema,
    tableName: 'stakes',
  });

  Stake.associate = (models) => {
    Stake.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  return Stake;
};
