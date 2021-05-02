"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // return queryInterface.addColumn("Users", "roles", {
    //   type: Sequelize.STRING,
    // });
    await queryInterface.createTable("Diary", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.DATE,
      },
      comment: {
        type: Sequelize.STRING,
      },
      feeling_img: {
        type: Sequelize.STRING,
      },
      feeling_name: {
        type: Sequelize.STRING,
      },
      weather: {
        type: Sequelize.STRING,
      },
      users_id: {
        type: Sequelize.INTEGER,
      },
      user_food_photo: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Diaries");
  },
};
