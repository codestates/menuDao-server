"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Diary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Diary.hasMany(models.Diary_food, { foreignKey: "diary_id" });
      Diary.belongsTo(models.Users, {
        foreignKey: { name: "users_id" },
      });
    }
  }
  Diary.init(
    {
      date: DataTypes.DATE,
      comment: DataTypes.STRING,
      feeling_img: DataTypes.STRING,
      feeling_name: DataTypes.STRING,
      weather: DataTypes.STRING,
      users_id: DataTypes.INTEGER,
      users_food_photo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Diary",
    }
  );
  return Diary;
};
