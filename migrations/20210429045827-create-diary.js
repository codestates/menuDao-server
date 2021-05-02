"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable("Diary", {
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
        users_food_photo: {
          type: Sequelize.STRING,
        },
        weather: {
          type: Sequelize.STRING,
        },
        users_id: {
          type: Sequelize.INTEGER,
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
        queryInterface.createTable("Diary_food", {
          diary_id: {
            type: Sequelize.INTEGER,
            references: { model: "Diary", key: "id" },
          },
        });
      });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Diaries");
  },
};
