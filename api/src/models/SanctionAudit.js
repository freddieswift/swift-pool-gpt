import { DataTypes, Model } from "sequelize";

export class SanctionAudit extends Model {}

export function initSanctionAuditModel(sequelize) {
  SanctionAudit.init(
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
      action: {
        type: DataTypes.ENUM(
          "ISSUED",
          "UPDATED",
          "REVOKED",
          "APPEALED",
          "APPEAL_RESOLVED"
        ),
        allowNull: false
      },
      actorUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "actor_user_id"
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "SanctionAudit",
      tableName: "sanction_audits",
      updatedAt: false,
      indexes: [{ fields: ["sanction_id", "created_at"] }]
    }
  );

  return SanctionAudit;
}
