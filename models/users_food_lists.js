"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users_food_lists extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users_food_lists.belongsTo(models.Users, {
        foreignKey: { name: "users_id" },
      });
      Users_food_lists.belongsTo(models.Food_lists, {
        foreignKey: { name: "food_lists_id" },
      });
    }
  }
  Users_food_lists.init(
    {
      food_lists_id: DataTypes.INTEGER,
      users_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Users_food_lists",
    }
  );
  return Users_food_lists;
};
