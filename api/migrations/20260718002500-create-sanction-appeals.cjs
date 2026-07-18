"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sanction_appeals", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      sanction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "player_sanctions", key: "id" },
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
        type: Sequelize.ENUM(
          "PENDING",
          "UPHELD",
          "REDUCED",
          "OVERTURNED",
          "WITHDRAWN"
        ),
        allowNull: false,
        defaultValue: "PENDING"
      },
      grounds: { type: Sequelize.STRING(5000), allowNull: false },
      submitted_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      submitted_at: { type: Sequelize.DATE, allowNull: false },
      resolution: { type: Sequelize.STRING(5000), allowNull: true },
      resolved_by_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.addIndex(
      "sanction_appeals",
      ["sanction_id", "status"]
    );
    await queryInterface.addIndex(
      "sanction_appeals",
      ["player_id", "created_at"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("sanction_appeals");
  }
};
