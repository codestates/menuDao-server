'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Food_menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Food_menu.init({
    photo: DataTypes.STRING,
    food_menu_name: DataTypes.STRING,
    food_lists_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Food_menu',
  });
  return Food_menu;
};