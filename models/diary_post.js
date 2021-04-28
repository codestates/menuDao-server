'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Diary_post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Diary_post.init({
    date: DataTypes.DATE,
    food_name: DataTypes.STRING,
    food_img: DataTypes.STRING,
    comment_text: DataTypes.STRING,
    feeling_img: DataTypes.STRING,
    feeling_name: DataTypes.STRING,
    weather: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Diary_post',
  });
  return Diary_post;
};