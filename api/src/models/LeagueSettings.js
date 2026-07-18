import { DataTypes, Model } from "sequelize";

export const HANDICAP_METHODS = Object.freeze({
  NONE: "NONE",
  PLAYER: "PLAYER",
  TEAM: "TEAM"
});

export class LeagueSettings extends Model {}

export function initLeagueSettingsModel(sequelize) {
  LeagueSettings.init(
    {
      leagueId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: "league_id"
      },
      handicapEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "handicap_enabled"
      },
      handicapMethod: {
        type: DataTypes.ENUM(...Object.values(HANDICAP_METHODS)),
        allowNull: false,
        defaultValue: HANDICAP_METHODS.NONE,
        field: "handicap_method"
      },
      allowCaptainRosterManagement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "allow_captain_roster_management"
      },
      allowCaptainResultEditing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "allow_captain_result_editing"
      },
      resultsRequireApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "results_require_approval"
      },
      publicEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "public_enabled"
      },
      publicRosterNames: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "public_roster_names"
      },
      publicPlayerStatistics: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "public_player_statistics"
      },
      publicVenueAddresses: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "public_venue_addresses"
      }
    },
    {
      sequelize,
      modelName: "LeagueSettings",
      tableName: "league_settings"
    }
  );

  return LeagueSettings;
}
