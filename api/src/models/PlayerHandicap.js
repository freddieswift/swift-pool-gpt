import { DataTypes, Model } from "sequelize";

export const HANDICAP_SOURCES = Object.freeze({
  MANUAL: "MANUAL",
  CALCULATED: "CALCULATED",
  IMPORTED: "IMPORTED"
});

export class PlayerHandicap extends Model {
  toJSON() {
    return {
      id: this.id,
      leagueId: this.leagueId,
      seasonId: this.seasonId,
      playerId: this.playerId,
      value: Number(this.value),
      source: this.source,
      effectiveFrom: this.effectiveFrom,
      effectiveUntil: this.effectiveUntil,
      notes: this.notes,
      createdByUserId: this.createdByUserId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initPlayerHandicapModel(sequelize) {
  PlayerHandicap.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      leagueId: { type: DataTypes.UUID, allowNull: false, field: "league_id" },
      seasonId: { type: DataTypes.UUID, allowNull: true, field: "season_id" },
      playerId: { type: DataTypes.UUID, allowNull: false, field: "player_id" },
      value: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
      source: {
        type: DataTypes.ENUM(...Object.values(HANDICAP_SOURCES)),
        allowNull: false,
        defaultValue: HANDICAP_SOURCES.MANUAL
      },
      effectiveFrom: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "effective_from"
      },
      effectiveUntil: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "effective_until"
      },
      notes: { type: DataTypes.STRING(1000), allowNull: true },
      createdByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "created_by_user_id"
      }
    },
    {
      sequelize,
      modelName: "PlayerHandicap",
      tableName: "player_handicaps",
      indexes: [
        { fields: ["league_id", "player_id"] },
        { fields: ["season_id", "player_id"] },
        { fields: ["player_id", "effective_from", "effective_until"] }
      ]
    }
  );
  return PlayerHandicap;
}
