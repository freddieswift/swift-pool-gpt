"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("season_rule_snapshots", {
      season_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "seasons", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      match_format_name: {
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
      handicap_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      handicap_method: {
        type: Sequelize.ENUM("NONE", "PLAYER", "TEAM"),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("season_rule_snapshots");
  }
};
