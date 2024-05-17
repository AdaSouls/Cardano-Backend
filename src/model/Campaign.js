const Sequelize = require('sequelize');
const config = require('../config/config');

module.exports = function(sequelize) {

  const { fn, DataTypes, Model } = Sequelize;

  class Campaign extends Model {
    toSanitisedJson() {
      return {
        id: this.id,
        number: this.number,
        title: this.title,
        startDate: this.startDate,
        endDate: this.endDate,
        details: this.details,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    };
  }

  Campaign.init(
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
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    }, {
      sequelize,
      schema: config.postgresql.schema,
      tableName: 'campaigns',
    }
  );

  return Campaign;
};
