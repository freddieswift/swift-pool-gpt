"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("leagues", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(140),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
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

    await queryInterface.addIndex("leagues", ["slug"], {
      unique: true,
      name: "leagues_slug_unique"
    });
    await queryInterface.addIndex("leagues", ["created_by_user_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("leagues");
  }
};
