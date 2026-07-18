"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("season_transition_plans", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      source_season_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "seasons", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE"
      },
      target_season_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "seasons", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE"
      },
      status: {
        type: Sequelize.ENUM("DRAFT", "APPROVED", "APPLIED", "CANCELLED"),
        allowNull: false, defaultValue: "DRAFT"
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      approved_by_user_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE", onDelete: "SET NULL"
      },
      approved_at: { type: Sequelize.DATE, allowNull: true },
      applied_by_user_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE", onDelete: "SET NULL"
      },
      applied_at: { type: Sequelize.DATE, allowNull: true },
      created_by_user_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE", onDelete: "RESTRICT"
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex("season_transition_plans", ["source_season_id", "status"]);
    await queryInterface.addIndex("season_transition_plans", ["target_season_id", "status"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("season_transition_plans");
  }
};
