import { DataTypes, Model } from "sequelize";

export const SEASON_STATUSES = Object.freeze({
  DRAFT: "DRAFT",
  REGISTRATION: "REGISTRATION",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
});

export class Season extends Model {
  toJSON() {
    return {
      id: this.id,
      leagueId: this.leagueId,
      name: this.name,
      slug: this.slug,
      startDate: this.startDate,
      endDate: this.endDate,
      registrationOpensAt: this.registrationOpensAt,
      registrationClosesAt: this.registrationClosesAt,
      status: this.status,
      matchFormatId: this.matchFormatId,
      teamsPlayEachOther: this.teamsPlayEachOther,
      useHomeAndAway: this.useHomeAndAway,
      pointsDeductionEnabled: this.pointsDeductionEnabled,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initSeasonModel(sequelize) {
  Season.init(
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
      slug: {
        type: DataTypes.STRING(140),
        allowNull: false
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "start_date"
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "end_date"
      },
      registrationOpensAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "registration_opens_at"
      },
      registrationClosesAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "registration_closes_at"
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SEASON_STATUSES)),
        allowNull: false,
        defaultValue: SEASON_STATUSES.DRAFT
      },
      matchFormatId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "match_format_id"
      },
      teamsPlayEachOther: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
        field: "teams_play_each_other"
      },
      useHomeAndAway: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "use_home_and_away"
      },
      pointsDeductionEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "points_deduction_enabled"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Season",
      tableName: "seasons",
      indexes: [
        { fields: ["league_id"] },
        { unique: true, fields: ["league_id", "slug"] },
        { fields: ["league_id", "status"] },
        { fields: ["start_date", "end_date"] }
      ]
    }
  );

  return Season;
}
