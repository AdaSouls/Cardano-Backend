const Sequelize = require('sequelize');
const config = require('../config/config');

module.exports = function (sequelize) {

  const { DataTypes, Model } = Sequelize;

  class PointsHistory extends Model {
    toSanitisedJson() {
      let resp = {
        eventId: this.eventId,
        eventType: this.eventType,
        timeframe: this.timeframe,
        amountStaked: this.amountStaked,
        daysStaked: this.daysStaked,
        campaignNumber: this.campaignNumber,
        multipliers: this.multipliers,
        pointsAwarded: this.pointsAwarded,
        userId: this.userId,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
      return resp;
    };
  }

  PointsHistory.init({
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
    eventId: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
      allowNull: false,
    },
    eventType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    timeframe: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amountStaked: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    daysStaked: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    campaignNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    multipliers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    pointsAwarded: {
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
    tableName: 'points_history',
  });

  PointsHistory.associate = (models) => {
    PointsHistory.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  return PointsHistory;
};
