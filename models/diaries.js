"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Diaries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Diaries.hasMany(models.Diary_food, {
        foreignKey: { name: "diary_id" },
      });
      Diaries.belongsTo(models.Users, {
        foreignKey: { name: "users_id" },
      });
    }
  }
  Diaries.init(
    {
      date: DataTypes.DATE,
      feeling: DataTypes.STRING,
      weather: DataTypes.STRING,
      choice_menu: DataTypes.STRING,
      users_id: DataTypes.STRING,
      comment: DataTypes.STRING,
      big_choice_menu: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Diaries",
    }
  );
  return Diaries;
};
