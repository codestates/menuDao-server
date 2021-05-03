"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable("Food_lists", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        food_lists_name: {
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
        queryInterface.addColumn("Users_food_lists", "food_lists_id", {
          type: Sequelize.INTEGER,
          references: { model: "Food_lists", key: "id" },
        });
      });
  },
  down: async (queryInterface, Sequelize) => {
    [
      await queryInterface.dropTable("Users_food_lists"),
      await queryInterface.dropTable("Food_lists"),
    ];
  },
};
