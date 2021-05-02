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
        food_lists_photo: {
          type: Sequelize.STRING,
        },
        food_lists_name: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
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
    await queryInterface.dropTable("Food_lists");
  },
};
