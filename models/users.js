"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users.hasMany(models.Diary, { foreignKey: "users_id" });
      Users.hasMany(models.Users_food_lists, { foreignKey: "users_id" });
    }
  }
  Users.init(
    {
      user_name: DataTypes.STRING,
      user_password: DataTypes.STRING,
      user_birthday: DataTypes.STRING,
      user_sex: DataTypes.STRING,
      user_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Users",
    }
  );
  return Users;
};
