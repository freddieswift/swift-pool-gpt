"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("match_result_audits", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      match_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "matches", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      action: {
        type: Sequelize.ENUM("SUBMITTED", "CORRECTED", "REOPENED"),
        allowNull: false
      },
      submitted_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      previous_result: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_result: {
        type: Sequelize.JSON,
        allowNull: true
      },
      reason: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex(
      "match_result_audits",
      ["match_id", "created_at"]
    );
    await queryInterface.addIndex(
      "match_result_audits",
      ["submitted_by_user_id"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("match_result_audits");
  }
};
