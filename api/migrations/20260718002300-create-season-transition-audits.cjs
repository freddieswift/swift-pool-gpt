"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("season_transition_audits", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      plan_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "season_transition_plans", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE"
      },
      action: {
        type: Sequelize.ENUM("GENERATED", "UPDATED", "APPROVED", "APPLIED", "CANCELLED"),
        allowNull: false
      },
      actor_user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE", onDelete: "RESTRICT"
      },
      details: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex("season_transition_audits", ["plan_id", "created_at"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("season_transition_audits");
  }
};
