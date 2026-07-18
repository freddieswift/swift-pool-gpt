import { DataTypes, Model } from "sequelize";

export const APPEAL_STATUSES = Object.freeze({
  PENDING: "PENDING",
  UPHELD: "UPHELD",
  REDUCED: "REDUCED",
  OVERTURNED: "OVERTURNED",
  WITHDRAWN: "WITHDRAWN"
});

export class SanctionAppeal extends Model {
  toJSON() {
    return {
      id: this.id,
      sanctionId: this.sanctionId,
      playerId: this.playerId,
      status: this.status,
      grounds: this.grounds,
      submittedByUserId: this.submittedByUserId,
      submittedAt: this.submittedAt,
      resolution: this.resolution,
      resolvedByUserId: this.resolvedByUserId,
      resolvedAt: this.resolvedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initSanctionAppealModel(sequelize) {
  SanctionAppeal.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      sanctionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "sanction_id"
      },
      playerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "player_id"
      },
      status: {
        type: DataTypes.ENUM(...Object.values(APPEAL_STATUSES)),
        allowNull: false,
        defaultValue: APPEAL_STATUSES.PENDING
      },
      grounds: {
        type: DataTypes.STRING(5000),
        allowNull: false
      },
      submittedByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "submitted_by_user_id"
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "submitted_at"
      },
      resolution: {
        type: DataTypes.STRING(5000),
        allowNull: true
      },
      resolvedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "resolved_by_user_id"
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "resolved_at"
      }
    },
    {
      sequelize,
      modelName: "SanctionAppeal",
      tableName: "sanction_appeals",
      indexes: [
        { fields: ["sanction_id", "status"] },
        { fields: ["player_id", "created_at"] }
      ]
    }
  );

  return SanctionAppeal;
}
