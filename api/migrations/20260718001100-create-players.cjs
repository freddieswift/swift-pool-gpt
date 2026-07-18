"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("players", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      league_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "leagues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      first_name: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(80),
        allowNull: false
      },
      display_name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(40),
        allowNull: true
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex("players", ["league_id"]);
    await queryInterface.addIndex("players", ["league_id", "last_name", "first_name"]);
    await queryInterface.addIndex("players", ["user_id"], {
      unique: true,
      name: "players_user_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("players");
  }
};
