const Sequelize = require('sequelize');
const config = require('../config/config');
const models = require("../model");

function between(x, min, max) {
  return x >= min && x < max;
}

module.exports = function (sequelize) {

  const { fn, col, DataTypes, Model, Op } = Sequelize;

  class User extends Model {
    toSanitisedJson() {
      let resp = {
        userId: this.userId,
        mvAuthKey: this.mvAuthKey,
        mvAuthType: this.mvAuthType,
        email: this.email,
        name: this.name,
        smartWallet: this.smartWallet,
        embeddedWallet: this.embeddedWallet,
        wallet: this.wallet,
        points: this.points,
        tier: this.tier,
        linkedGames: this.linkedGames,
        role: this.role,
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
    mvAuthKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mvAuthType: {
      type: DataTypes.STRING(30),
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
    smartWallet: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    embeddedWallet: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    wallet: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    tier: {
      type: DataTypes.STRING(20),
      defaultValue: "no tier",
      allowNull: false,
    },
    linkedGames: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  }, {
    sequelize,
    schema: config.postgresql.schema,
    tableName: 'users',
    hooks: {
      beforeSave: (user, options) => {
        if (between(user.dataValues.points, 0, config.points.tier.bronze)) {
          user.tier = "no tier";
        } else {
          if (between(user.dataValues.points, config.points.tier.bronze, config.points.tier.silver)) {
            user.tier = "bronze";
          } else {
            if (between(user.dataValues.points, config.points.tier.silver, config.points.tier.gold)) {
              user.tier = "silver";
            } else {
              if (between(user.dataValues.points, config.points.tier.gold, config.points.tier.platinum)) {
                user.tier = "gold";
              } else {
                if (user.dataValues.points >= config.points.tier.platinum) {
                  user.tier = "platinum";
                }
              }
            }
          }
        }
      }
    },
    indexes: [
      {
        name: 'users_userid',
        unique: true,
        fields: ['userId'],
      },
      {
        name: 'users_mvauthkey',
        unique: true,
        fields: ['mvAuthKey'],
      },
      // it seems counter-intuitive to not make email unique, but we don't have to worry as b2c enforces
      // it, and we could have a situation where an entry in our database no longer exists on b2c etc etc
      {
        name: 'users_email',
        unique: false,
        fields: [fn('lower', col('email'))],
      },
      {
        name: 'users_name',
        unique: false,
        fields: [fn('lower', col('name'))],
      },
      {
        name: 'users_smart_wallet',
        unique: true,
        fields: [fn('lower', col('smartWallet'))],
        where: {
          smartWallet: {
            [Op.ne]: null
          }
        },
      },
    ],
  });

  return User;
};
