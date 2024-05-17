const Sequelize = require('sequelize');
const config = require('../config/config');

module.exports = function (sequelize) {

  const { DataTypes, Model } = Sequelize;

  class Otp extends Model {
    toSanitisedJson() {
      let resp = {
        userId: this.userId,
        gameId: this.gameId,
        otp: this.otp,
        expiresAt: this.expiresAt,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
      return resp;
    };
  }

  Otp.init({
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
    expiresAt: {
      type: DataTypes.DATE,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    gameId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    sequelize,
    schema: config.postgresql.schema,
    tableName: 'otps',
    indexes: [
      {
        name: 'users_otp',
        unique: true,
        fields: ['userId', 'gameId'],
      },
    ],
  });

  return Otp;
};
