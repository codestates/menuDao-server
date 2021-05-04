"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Diaries", "users_id", {
      type: Sequelize.INTEGER,
      references: { model: "Users", key: "id" },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Diaries", "users_id");
  },
};
