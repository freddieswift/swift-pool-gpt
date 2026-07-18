import { DataTypes, Model } from "sequelize";

export const SANCTION_TYPES = Object.freeze({
  WARNING: "WARNING",
  DATE_SUSPENSION: "DATE_SUSPENSION",
  SEASON_SUSPENSION: "SEASON_SUSPENSION",
  INDEFINITE_SUSPENSION: "INDEFINITE_SUSPENSION",
  OTHER: "OTHER"
});

export const SANCTION_STATUSES = Object.freeze({
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED"
});

export class PlayerSanction extends Model {
  toJSON() {
    return {
      id: this.id,
      leagueId: this.leagueId,
      seasonId: this.seasonId,
      playerId: this.playerId,
      type: this.type,
      status: this.status,
      reason: this.reason,
      startsOn: this.startsOn,
      endsOn: this.endsOn,
      preventsMatchPlay: this.preventsMatchPlay,
      issuedByUserId: this.issuedByUserId,
      revokedByUserId: this.revokedByUserId,
      revokedAt: this.revokedAt,
      revocationReason: this.revocationReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initPlayerSanctionModel(sequelize) {
  PlayerSanction.init(
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
      seasonId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "season_id"
      },
      playerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "player_id"
      },
      type: {
        type: DataTypes.ENUM(...Object.values(SANCTION_TYPES)),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SANCTION_STATUSES)),
        allowNull: false,
        defaultValue: SANCTION_STATUSES.ACTIVE
      },
      reason: {
        type: DataTypes.STRING(2000),
        allowNull: false
      },
      startsOn: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "starts_on"
      },
      endsOn: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "ends_on"
      },
      preventsMatchPlay: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "prevents_match_play"
      },
      issuedByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "issued_by_user_id"
      },
      revokedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "revoked_by_user_id"
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "revoked_at"
      },
      revocationReason: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: "revocation_reason"
      }
    },
    {
      sequelize,
      modelName: "PlayerSanction",
      tableName: "player_sanctions",
      indexes: [
        { fields: ["league_id", "player_id", "status"] },
        { fields: ["season_id", "status"] },
        { fields: ["player_id", "starts_on", "ends_on"] }
      ]
    }
  );

  return PlayerSanction;
}
