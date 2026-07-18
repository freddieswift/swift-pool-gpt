"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(254),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
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
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_login_at: {
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

    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "users_email_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  }
};
