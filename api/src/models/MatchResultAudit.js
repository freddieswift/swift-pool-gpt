import { DataTypes, Model } from "sequelize";

export class MatchResultAudit extends Model {}

export function initMatchResultAuditModel(sequelize) {
  MatchResultAudit.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      matchId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "match_id"
      },
      action: {
        type: DataTypes.ENUM("SUBMITTED", "CORRECTED", "REOPENED"),
        allowNull: false
      },
      submittedByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "submitted_by_user_id"
      },
      previousResult: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "previous_result"
      },
      newResult: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "new_result"
      },
      reason: {
        type: DataTypes.STRING(500),
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "MatchResultAudit",
      tableName: "match_result_audits",
      updatedAt: false,
      indexes: [
        { fields: ["match_id", "created_at"] },
        { fields: ["submitted_by_user_id"] }
      ]
    }
  );

  return MatchResultAudit;
}
