import { DataTypes, Model } from "sequelize";

export const SCORING_METHODS = Object.freeze({
  FRAME_POINTS: "FRAME_POINTS",
  MATCH_RESULT: "MATCH_RESULT"
});

export class MatchFormat extends Model {}

export function initMatchFormatModel(sequelize) {
  MatchFormat.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      leagueId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "league_id"
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      framesPerMatch: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "frames_per_match"
      },
      scoringMethod: {
        type: DataTypes.ENUM(...Object.values(SCORING_METHODS)),
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
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_default"
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active"
      }
    },
    {
      sequelize,
      modelName: "MatchFormat",
      tableName: "match_formats",
      indexes: [
        { fields: ["league_id"] },
        { unique: true, fields: ["league_id", "name"] }
      ]
    }
  );

  return MatchFormat;
}
