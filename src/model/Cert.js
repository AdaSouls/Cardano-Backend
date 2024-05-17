const Sequelize = require('sequelize');
const config = require('../config/config');

module.exports = function (sequelize) {

  const { DataTypes, Model } = Sequelize;

  class Cert extends Model {
    toSanitisedJson() {
      let resp = {
        certId: this.certId,
        certType: this.certType,
        value: this.value,
        expiresAt: this.expiresAt,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
      return resp;
    };
  }

  Cert.init({
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
    certId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      allowNull: false,
    },
    certType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    sequelize,
    schema: config.postgresql.schema,
    tableName: 'certs',
    indexes: [
      {
        fields: ['certId'],
        unique: true,
      },
    ],
  });

  return Cert;
};
