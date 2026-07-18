import { DataTypes, Model } from "sequelize";
import { HANDICAP_SOURCES } from "./PlayerHandicap.js";

export class TeamHandicap extends Model {
  toJSON() {
    return {
      id: this.id,
      leagueId: this.leagueId,
      seasonId: this.seasonId,
      seasonTeamId: this.seasonTeamId,
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

export function initTeamHandicapModel(sequelize) {
  TeamHandicap.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      leagueId: { type: DataTypes.UUID, allowNull: false, field: "league_id" },
      seasonId: { type: DataTypes.UUID, allowNull: false, field: "season_id" },
      seasonTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "season_team_id"
      },
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
      modelName: "TeamHandicap",
      tableName: "team_handicaps",
      indexes: [
        { fields: ["season_id", "season_team_id"] },
        { fields: ["season_team_id", "effective_from", "effective_until"] }
      ]
    }
  );
  return TeamHandicap;
}
