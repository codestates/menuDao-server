"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable("Food", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        food_name: {
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
        queryInterface.addColumn("Diary_food", "Food_id", {
          type: Sequelize.INTEGER,
          references: { model: "Food", key: "id" },
        });
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Diary_food", "Food_id");
  },
};
