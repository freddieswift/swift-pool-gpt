"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sanction_audits", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      sanction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "player_sanctions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      action: {
        type: Sequelize.ENUM(
          "ISSUED",
          "UPDATED",
          "REVOKED",
          "APPEALED",
          "APPEAL_RESOLVED"
        ),
        allowNull: false
      },
      actor_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      details: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex(
      "sanction_audits",
      ["sanction_id", "created_at"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("sanction_audits");
  }
};
