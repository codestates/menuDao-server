"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable("Users", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        user_name: {
          type: Sequelize.STRING,
        },
        user_password: {
          type: Sequelize.STRING,
        },
        user_birthday: {
          type: Sequelize.STRING,
        },
        user_sex: {
          type: Sequelize.STRING,
        },
        user_id: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          defaultValue: Sequelize.literal("now()"),
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          defaultValue: Sequelize.literal("now()"),
          type: Sequelize.DATE,
        },
      })
      .then(function () {
        queryInterface.createTable("Users_food_lists", {
          users_id: {
            type: Sequelize.INTEGER,
            references: { model: "Users", key: "id" },
          },
        });
      });
  },
  down: async (queryInterface, Sequelize) => {
    [
      await queryInterface.dropTable("Users_food_lists"),
      await queryInterface.dropTable("Users"),
    ];
  },
};
