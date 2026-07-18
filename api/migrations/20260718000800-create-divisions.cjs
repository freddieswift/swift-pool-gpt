"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("divisions", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      season_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "seasons", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(140),
        allowNull: false
      },
      position: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      promotion_places: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      relegation_places: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("divisions", ["season_id"]);
    await queryInterface.addIndex("divisions", ["season_id", "slug"], {
      unique: true,
      name: "divisions_season_slug_unique"
    });
    await queryInterface.addIndex("divisions", ["season_id", "position"], {
      unique: true,
      name: "divisions_season_position_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("divisions");
  }
};
