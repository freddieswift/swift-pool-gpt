import { DataTypes, Model } from "sequelize";

export class SeasonTransitionAudit extends Model {}

export function initSeasonTransitionAuditModel(sequelize) {
  SeasonTransitionAudit.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      planId: { type: DataTypes.UUID, allowNull: false, field: "plan_id" },
      action: {
        type: DataTypes.ENUM("GENERATED", "UPDATED", "APPROVED", "APPLIED", "CANCELLED"),
        allowNull: false
      },
      actorUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "actor_user_id"
      },
      details: { type: DataTypes.JSON, allowNull: true }
    },
    {
      sequelize,
      modelName: "SeasonTransitionAudit",
      tableName: "season_transition_audits",
      updatedAt: false,
      indexes: [{ fields: ["plan_id", "created_at"] }]
    }
  );
  return SeasonTransitionAudit;
}
