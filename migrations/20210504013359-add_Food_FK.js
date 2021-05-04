"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Diary_food", "Food_id", {
      type: Sequelize.INTEGER,
      references: { model: "Food", key: "id" },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Diary_food", "Food_id");
  },
};
