"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Food_menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Food_menu.hasMany(models.Food, { foreignKey: "food_menu_id" });
      Food_menu.belongsTo(models.Food_lists, {
        foreignKey: { name: "food_lists_id" },
      });
    }
  }
  Food_menu.init(
    {
      food_menu_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Food_menu",
    }
  );
  return Food_menu;
};
