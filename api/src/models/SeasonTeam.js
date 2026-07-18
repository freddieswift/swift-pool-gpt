import { DataTypes, Model } from "sequelize";

export const SEASON_TEAM_STATUSES = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  WITHDRAWN: "WITHDRAWN"
});

export class SeasonTeam extends Model {
  toJSON() {
    return {
      id: this.id,
      seasonId: this.seasonId,
      teamId: this.teamId,
      divisionId: this.divisionId,
      status: this.status,
      seed: this.seed,
      pointsAdjustment: this.pointsAdjustment,
      adjustmentReason: this.adjustmentReason,
      registeredAt: this.registeredAt,
      approvedAt: this.approvedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initSeasonTeamModel(sequelize) {
  SeasonTeam.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      seasonId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "season_id"
      },
      teamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "team_id"
      },
      divisionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "division_id"
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SEASON_TEAM_STATUSES)),
        allowNull: false,
        defaultValue: SEASON_TEAM_STATUSES.PENDING
      },
      seed: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
      },
      pointsAdjustment: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: "points_adjustment"
      },
      adjustmentReason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "adjustment_reason"
      },
      registeredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "registered_at"
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "approved_at"
      }
    },
    {
      sequelize,
      modelName: "SeasonTeam",
      tableName: "season_teams",
      indexes: [
        { unique: true, fields: ["season_id", "team_id"] },
        { fields: ["division_id"] },
        { fields: ["season_id", "status"] }
      ]
    }
  );

  return SeasonTeam;
}
