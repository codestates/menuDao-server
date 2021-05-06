"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn("Diaries", "date");
    await queryInterface.addColumn("Diaries", "big_choice_menu", {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Diaries", "big_choice_menu");
  },
};
