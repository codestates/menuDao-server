"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Diaries", "date");
    // await queryInterface.addColumn("Diaries", "date", {
    //   type: Sequelize.DATE,
    //   allowNull: false,
    //   defaultValue: now(),
    // });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Diaries", "date", {
      type: Sequelize.DATE,
    });
    // await queryInterface.removeColumn("Diaries", "date");
  },
};
