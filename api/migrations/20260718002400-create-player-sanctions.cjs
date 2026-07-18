"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("player_sanctions", {
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
        allowNull: true,
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
      type: {
        type: Sequelize.ENUM(
          "WARNING",
          "DATE_SUSPENSION",
          "SEASON_SUSPENSION",
          "INDEFINITE_SUSPENSION",
          "OTHER"
        ),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "EXPIRED", "REVOKED"),
        allowNull: false,
        defaultValue: "ACTIVE"
      },
      reason: { type: Sequelize.STRING(2000), allowNull: false },
      starts_on: { type: Sequelize.DATEONLY, allowNull: false },
      ends_on: { type: Sequelize.DATEONLY, allowNull: true },
      prevents_match_play: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      issued_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      revoked_by_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      revoked_at: { type: Sequelize.DATE, allowNull: true },
      revocation_reason: { type: Sequelize.STRING(1000), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex(
      "player_sanctions",
      ["league_id", "player_id", "status"]
    );
    await queryInterface.addIndex(
      "player_sanctions",
      ["season_id", "status"]
    );
    await queryInterface.addIndex(
      "player_sanctions",
      ["player_id", "starts_on", "ends_on"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("player_sanctions");
  }
};
