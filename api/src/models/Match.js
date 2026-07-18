import { DataTypes, Model } from "sequelize";

export const MATCH_STATUSES = Object.freeze({
  SCHEDULED: "SCHEDULED",
  POSTPONED: "POSTPONED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
});

export class Match extends Model {
  toJSON() {
    return {
      id: this.id,
      seasonId: this.seasonId,
      divisionId: this.divisionId,
      homeSeasonTeamId: this.homeSeasonTeamId,
      awaySeasonTeamId: this.awaySeasonTeamId,
      roundNumber: this.roundNumber,
      legNumber: this.legNumber,
      scheduledAt: this.scheduledAt,
      venueName: this.venueName,
      status: this.status,
      postponedReason: this.postponedReason,
      notes: this.notes,
      completedAt: this.completedAt,
      homeFramesWon: this.homeFramesWon,
      awayFramesWon: this.awayFramesWon,
      homeMatchPoints: this.homeMatchPoints,
      awayMatchPoints: this.awayMatchPoints,
      resultNotes: this.resultNotes,
      resultSubmittedByUserId: this.resultSubmittedByUserId,
      resultSubmittedAt: this.resultSubmittedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initMatchModel(sequelize) {
  Match.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      seasonId: { type: DataTypes.UUID, allowNull: false, field: "season_id" },
      divisionId: { type: DataTypes.UUID, allowNull: false, field: "division_id" },
      homeSeasonTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "home_season_team_id"
      },
      awaySeasonTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "away_season_team_id"
      },
      roundNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "round_number"
      },
      legNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
        field: "leg_number"
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "scheduled_at"
      },
      venueName: {
        type: DataTypes.STRING(160),
        allowNull: true,
        field: "venue_name"
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MATCH_STATUSES)),
        allowNull: false,
        defaultValue: MATCH_STATUSES.SCHEDULED
      },
      postponedReason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "postponed_reason"
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "completed_at"
      },
      homeFramesWon: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: "home_frames_won"
      },
      awayFramesWon: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: "away_frames_won"
      },
      homeMatchPoints: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: "home_match_points"
      },
      awayMatchPoints: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0,
        field: "away_match_points"
      },
      resultNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "result_notes"
      },
      resultSubmittedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "result_submitted_by_user_id"
      },
      resultSubmittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "result_submitted_at"
      }
    },
    {
      sequelize,
      modelName: "Match",
      tableName: "matches",
      indexes: [
        { fields: ["season_id", "scheduled_at"] },
        { fields: ["division_id", "round_number"] },
        { fields: ["home_season_team_id", "scheduled_at"] },
        { fields: ["away_season_team_id", "scheduled_at"] },
        {
          unique: true,
          fields: [
            "season_id",
            "division_id",
            "leg_number",
            "round_number",
            "home_season_team_id",
            "away_season_team_id"
          ]
        }
      ],
      validate: {
        differentTeams() {
          if (this.homeSeasonTeamId === this.awaySeasonTeamId) {
            throw new Error("Home and away teams must be different");
          }
        }
      }
    }
  );
  return Match;
}
