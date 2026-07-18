"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("season_transition_entries", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      plan_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "season_transition_plans", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE"
      },
      team_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "teams", key: "id" },
        onUpdate: "CASCADE", onDelete: "RESTRICT"
      },
      source_season_team_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "season_teams", key: "id" },
        onUpdate: "CASCADE", onDelete: "RESTRICT"
      },
      source_division_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: "divisions", key: "id" },
        onUpdate: "CASCADE", onDelete: "SET NULL"
      },
      target_division_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: "divisions", key: "id" },
        onUpdate: "CASCADE", onDelete: "SET NULL"
      },
      source_position: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      action: {
        type: Sequelize.ENUM("PROMOTE", "RELEGATE", "RETAIN", "UNASSIGNED"),
        allowNull: false
      },
      seed: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      notes: { type: Sequelize.STRING(1000), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex("season_transition_entries", ["plan_id", "team_id"], {
      unique: true,
      name: "season_transition_entries_plan_team_unique"
    });
    await queryInterface.addIndex("season_transition_entries", ["target_division_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("season_transition_entries");
  }
};
