"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teams", {
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
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      short_name: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING(140),
        allowNull: false
      },
      venue_name: {
        type: Sequelize.STRING(160),
        allowNull: true
      },
      venue_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING(254),
        allowNull: true
      },
      contact_phone: {
        type: Sequelize.STRING(40),
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

    await queryInterface.addIndex("teams", ["league_id"]);
    await queryInterface.addIndex("teams", ["league_id", "slug"], {
      unique: true,
      name: "teams_league_slug_unique"
    });
    await queryInterface.addIndex("teams", ["league_id", "name"], {
      unique: true,
      name: "teams_league_name_unique"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("teams");
  }
};
