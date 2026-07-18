"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("matches", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      season_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "seasons", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      division_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "divisions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      home_season_team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "season_teams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      away_season_team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "season_teams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      round_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      leg_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      venue_name: {
        type: Sequelize.STRING(160),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          "SCHEDULED",
          "POSTPONED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "SCHEDULED"
      },
      postponed_reason: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("matches", ["season_id", "scheduled_at"]);
    await queryInterface.addIndex("matches", ["division_id", "round_number"]);
    await queryInterface.addIndex("matches", ["home_season_team_id", "scheduled_at"]);
    await queryInterface.addIndex("matches", ["away_season_team_id", "scheduled_at"]);
    await queryInterface.addIndex(
      "matches",
      [
        "season_id",
        "division_id",
        "leg_number",
        "round_number",
        "home_season_team_id",
        "away_season_team_id"
      ],
      { unique: true, name: "matches_generated_fixture_unique" }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("matches");
  }
};
