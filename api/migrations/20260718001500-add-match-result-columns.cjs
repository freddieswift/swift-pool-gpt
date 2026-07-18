"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("matches", "home_frames_won", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn("matches", "away_frames_won", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn("matches", "home_match_points", {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn("matches", "away_match_points", {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn("matches", "result_notes", {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn("matches", "result_submitted_by_user_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    await queryInterface.addColumn("matches", "result_submitted_at", {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("matches", "result_submitted_at");
    await queryInterface.removeColumn("matches", "result_submitted_by_user_id");
    await queryInterface.removeColumn("matches", "result_notes");
    await queryInterface.removeColumn("matches", "away_match_points");
    await queryInterface.removeColumn("matches", "home_match_points");
    await queryInterface.removeColumn("matches", "away_frames_won");
    await queryInterface.removeColumn("matches", "home_frames_won");
  }
};
