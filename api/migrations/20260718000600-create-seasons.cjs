"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("seasons", {
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
      slug: {
        type: Sequelize.STRING(140),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      registration_opens_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      registration_closes_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          "DRAFT",
          "REGISTRATION",
          "ACTIVE",
          "COMPLETED",
          "CANCELLED"
        ),
        allowNull: false,
        defaultValue: "DRAFT"
      },
      match_format_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "match_formats", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      teams_play_each_other: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1
      },
      use_home_and_away: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      points_deduction_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("seasons", ["league_id"]);
    await queryInterface.addIndex("seasons", ["league_id", "slug"], {
      unique: true,
      name: "seasons_league_slug_unique"
    });
    await queryInterface.addIndex("seasons", ["league_id", "status"]);
    await queryInterface.addIndex("seasons", ["start_date", "end_date"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("seasons");
  }
};
