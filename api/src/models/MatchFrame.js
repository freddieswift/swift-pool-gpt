import { DataTypes, Model } from "sequelize";

export const FRAME_RESULT_TYPES = Object.freeze({
  NORMAL: "NORMAL",
  WALKOVER: "WALKOVER",
  FORFEIT: "FORFEIT",
  VOID: "VOID"
});

export class MatchFrame extends Model {
  toJSON() {
    return {
      id: this.id,
      matchId: this.matchId,
      frameNumber: this.frameNumber,
      homePlayerId: this.homePlayerId,
      awayPlayerId: this.awayPlayerId,
      winnerPlayerId: this.winnerPlayerId,
      winnerSide: this.winnerSide,
      resultType: this.resultType,
      homeFramePoints: this.homeFramePoints,
      awayFramePoints: this.awayFramePoints,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initMatchFrameModel(sequelize) {
  MatchFrame.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      matchId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "match_id"
      },
      frameNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "frame_number"
      },
      homePlayerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "home_player_id"
      },
      awayPlayerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "away_player_id"
      },
      winnerPlayerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "winner_player_id"
      },
      winnerSide: {
        type: DataTypes.ENUM("HOME", "AWAY", "NONE"),
        allowNull: false,
        defaultValue: "NONE",
        field: "winner_side"
      },
      resultType: {
        type: DataTypes.ENUM(...Object.values(FRAME_RESULT_TYPES)),
        allowNull: false,
        defaultValue: FRAME_RESULT_TYPES.NORMAL,
        field: "result_type"
      },
      homeFramePoints: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: "home_frame_points"
      },
      awayFramePoints: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: "away_frame_points"
      },
      notes: {
        type: DataTypes.STRING(1000),
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "MatchFrame",
      tableName: "match_frames",
      indexes: [
        { unique: true, fields: ["match_id", "frame_number"] },
        { fields: ["home_player_id"] },
        { fields: ["away_player_id"] },
        { fields: ["winner_player_id"] }
      ]
    }
  );

  return MatchFrame;
}
