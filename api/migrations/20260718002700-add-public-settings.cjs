"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("league_settings", "public_enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.addColumn(
      "league_settings",
      "public_roster_names",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
    await queryInterface.addColumn(
      "league_settings",
      "public_player_statistics",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
    await queryInterface.addColumn(
      "league_settings",
      "public_venue_addresses",
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "league_settings",
      "public_venue_addresses"
    );
    await queryInterface.removeColumn(
      "league_settings",
      "public_player_statistics"
    );
    await queryInterface.removeColumn(
      "league_settings",
      "public_roster_names"
    );
    await queryInterface.removeColumn(
      "league_settings",
      "public_enabled"
    );
  }
};
