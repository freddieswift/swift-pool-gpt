import { DataTypes, Model } from "sequelize";

export const ROSTER_STATUSES = Object.freeze({
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  RELEASED: "RELEASED"
});

export class SeasonTeamPlayer extends Model {
  toJSON() {
    return {
      id: this.id,
      seasonTeamId: this.seasonTeamId,
      playerId: this.playerId,
      status: this.status,
      isCaptain: this.isCaptain,
      joinedAt: this.joinedAt,
      leftAt: this.leftAt,
      eligibleFrom: this.eligibleFrom,
      eligibleUntil: this.eligibleUntil,
      shirtNumber: this.shirtNumber,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initSeasonTeamPlayerModel(sequelize) {
  SeasonTeamPlayer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      seasonTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "season_team_id"
      },
      playerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "player_id"
      },
      status: {
        type: DataTypes.ENUM(...Object.values(ROSTER_STATUSES)),
        allowNull: false,
        defaultValue: ROSTER_STATUSES.ACTIVE
      },
      isCaptain: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_captain"
      },
      joinedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "joined_at"
      },
      leftAt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "left_at"
      },
      eligibleFrom: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "eligible_from"
      },
      eligibleUntil: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "eligible_until"
      },
      shirtNumber: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: "shirt_number"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "SeasonTeamPlayer",
      tableName: "season_team_players",
      indexes: [
        { unique: true, fields: ["season_team_id", "player_id"] },
        { fields: ["player_id", "status"] },
        { fields: ["season_team_id", "is_captain"] }
      ]
    }
  );

  return SeasonTeamPlayer;
}
