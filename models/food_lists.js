'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Food_lists extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Food_lists.init({
    food_lists_photo: DataTypes.STRING,
    food_lists_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Food_lists',
  });
  return Food_lists;
};