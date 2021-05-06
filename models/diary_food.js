"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Diary_food extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Diary_food.belongsTo(models.Food, {
        foreignKey: { name: "food_id" },
      });
      Diary_food.belongsTo(models.Diaries, {
        foreignKey: { name: "diary_id" },
      });
    }
  }
  Diary_food.init(
    {
      food_id: DataTypes.INTEGER,
      diary_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Diary_food",
    }
  );
  return Diary_food;
};
