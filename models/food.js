"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Food extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Food.hasMany(models.Diary_food, { foreignKey: "food_id" });
      Food.belongsTo(models.Food_menu, {
        foreignKey: { name: "food_menu_id" },
      });
    }
  }
  Food.init(
    {
      food_name: DataTypes.STRING,
      // food_menu_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Food",
    }
  );
  return Food;
};
