"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Diary_food", {
      diary_id: {
        type: Sequelize.INTEGER,
        references: { model: "Diaries", key: "id" },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Diaries");
  },
};
