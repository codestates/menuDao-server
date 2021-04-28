'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Diary_posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      food_name: {
        type: Sequelize.STRING
      },
      food_img: {
        type: Sequelize.STRING
      },
      comment_text: {
        type: Sequelize.STRING
      },
      feeling_img: {
        type: Sequelize.STRING
      },
      feeling_name: {
        type: Sequelize.STRING
      },
      weather: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Diary_posts');
  }
};