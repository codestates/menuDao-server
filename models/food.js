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
    }
  }
  Food.init(
    {
      food_photo: DataTypes.STRING,
      food_name: DataTypes.STRING,
      food_menu_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Food",
    }
  );
  return Food;
};
