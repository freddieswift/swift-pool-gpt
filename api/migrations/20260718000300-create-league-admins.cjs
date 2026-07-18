"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("league_admins", {
      league_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "leagues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      role: {
        type: Sequelize.ENUM("OWNER", "ADMIN"),
        allowNull: false,
        defaultValue: "ADMIN"
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

    await queryInterface.addIndex("league_admins", ["user_id"]);
    await queryInterface.addIndex("league_admins", ["league_id", "role"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("league_admins");
  }
};
