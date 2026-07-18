"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("season_team_players", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      season_team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "season_teams", key: "id" },
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
      status: {
        type: Sequelize.ENUM("ACTIVE", "SUSPENDED", "RELEASED"),
        allowNull: false,
        defaultValue: "ACTIVE"
      },
      is_captain: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      joined_at: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      left_at: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      eligible_from: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      eligible_until: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      shirt_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
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

    await queryInterface.addIndex(
      "season_team_players",
      ["season_team_id", "player_id"],
      {
        unique: true,
        name: "season_team_players_team_player_unique"
      }
    );
    await queryInterface.addIndex("season_team_players", ["player_id", "status"]);
    await queryInterface.addIndex("season_team_players", ["season_team_id", "is_captain"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("season_team_players");
  }
};
