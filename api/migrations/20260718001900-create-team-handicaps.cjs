"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("team_handicaps", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      league_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "leagues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      season_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "seasons", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      season_team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "season_teams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      value: { type: Sequelize.DECIMAL(8, 2), allowNull: false },
      source: {
        type: Sequelize.ENUM("MANUAL", "CALCULATED", "IMPORTED"),
        allowNull: false,
        defaultValue: "MANUAL"
      },
      effective_from: { type: Sequelize.DATEONLY, allowNull: false },
      effective_until: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.STRING(1000), allowNull: true },
      created_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex(
      "team_handicaps",
      ["season_id", "season_team_id"]
    );
    await queryInterface.addIndex(
      "team_handicaps",
      ["season_team_id", "effective_from", "effective_until"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("team_handicaps");
  }
};
