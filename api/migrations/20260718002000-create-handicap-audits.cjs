"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("handicap_audits", {
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
      entity_type: {
        type: Sequelize.ENUM("PLAYER", "TEAM"),
        allowNull: false
      },
      entity_id: { type: Sequelize.UUID, allowNull: false },
      action: {
        type: Sequelize.ENUM("CREATED", "UPDATED", "EXPIRED", "RECALCULATED"),
        allowNull: false
      },
      previous_value: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      new_value: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      reason: { type: Sequelize.STRING(500), allowNull: true },
      acted_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex(
      "handicap_audits",
      ["league_id", "entity_type", "entity_id"]
    );
    await queryInterface.addIndex("handicap_audits", ["season_id", "created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("handicap_audits");
  }
};
