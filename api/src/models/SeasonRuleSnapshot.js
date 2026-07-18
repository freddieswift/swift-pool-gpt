import { DataTypes, Model } from "sequelize";

export class SeasonRuleSnapshot extends Model {}

export function initSeasonRuleSnapshotModel(sequelize) {
  SeasonRuleSnapshot.init(
    {
      seasonId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: "season_id"
      },
      matchFormatName: {
        type: DataTypes.STRING(120),
        allowNull: false,
        field: "match_format_name"
      },
      framesPerMatch: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "frames_per_match"
      },
      scoringMethod: {
        type: DataTypes.ENUM("FRAME_POINTS", "MATCH_RESULT"),
        allowNull: false,
        field: "scoring_method"
      },
      pointsPerFrame: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: "points_per_frame"
      },
      winPoints: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: "win_points"
      },
      drawPoints: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: "draw_points"
      },
      lossPoints: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: "loss_points"
      },
      handicapEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: "handicap_enabled"
      },
      handicapMethod: {
        type: DataTypes.ENUM("NONE", "PLAYER", "TEAM"),
        allowNull: false,
        field: "handicap_method"
      }
    },
    {
      sequelize,
      modelName: "SeasonRuleSnapshot",
      tableName: "season_rule_snapshots",
      updatedAt: false
    }
  );

  return SeasonRuleSnapshot;
}
