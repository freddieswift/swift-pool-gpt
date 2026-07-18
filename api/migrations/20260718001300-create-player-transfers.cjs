"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("player_transfers", {
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
      player_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "players", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      from_season_team_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "season_teams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      to_season_team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "season_teams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      effective_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("player_transfers", ["season_id", "player_id"]);
    await queryInterface.addIndex("player_transfers", ["to_season_team_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("player_transfers");
  }
};
