"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("match_formats", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      league_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "leagues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      frames_per_match: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      scoring_method: {
        type: Sequelize.ENUM("FRAME_POINTS", "MATCH_RESULT"),
        allowNull: false
      },
      points_per_frame: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      win_points: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      draw_points: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      loss_points: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex("match_formats", ["league_id"]);
    await queryInterface.addIndex("match_formats", ["league_id", "name"], {
      unique: true,
      name: "match_formats_league_name_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("match_formats");
  }
};
