"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("league_settings", {
      league_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "leagues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      handicap_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      handicap_method: {
        type: Sequelize.ENUM("NONE", "PLAYER", "TEAM"),
        allowNull: false,
        defaultValue: "NONE"
      },
      allow_captain_roster_management: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      allow_captain_result_editing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      results_require_approval: {
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("league_settings");
  }
};
