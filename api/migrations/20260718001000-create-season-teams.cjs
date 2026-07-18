"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("season_teams", {
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
      team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "teams", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      division_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "divisions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      status: {
        type: Sequelize.ENUM("PENDING", "APPROVED", "WITHDRAWN"),
        allowNull: false,
        defaultValue: "PENDING"
      },
      seed: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
      },
      points_adjustment: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      adjustment_reason: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      registered_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      approved_at: {
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

    await queryInterface.addIndex("season_teams", ["season_id", "team_id"], {
      unique: true,
      name: "season_teams_season_team_unique"
    });
    await queryInterface.addIndex("season_teams", ["division_id"]);
    await queryInterface.addIndex("season_teams", ["season_id", "status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("season_teams");
  }
};
