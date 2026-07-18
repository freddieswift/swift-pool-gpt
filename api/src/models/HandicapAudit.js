import { DataTypes, Model } from "sequelize";

export class HandicapAudit extends Model {}

export function initHandicapAuditModel(sequelize) {
  HandicapAudit.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      leagueId: { type: DataTypes.UUID, allowNull: false, field: "league_id" },
      seasonId: { type: DataTypes.UUID, allowNull: true, field: "season_id" },
      entityType: {
        type: DataTypes.ENUM("PLAYER", "TEAM"),
        allowNull: false,
        field: "entity_type"
      },
      entityId: { type: DataTypes.UUID, allowNull: false, field: "entity_id" },
      action: {
        type: DataTypes.ENUM("CREATED", "UPDATED", "EXPIRED", "RECALCULATED"),
        allowNull: false
      },
      previousValue: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: "previous_value"
      },
      newValue: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: "new_value"
      },
      reason: { type: DataTypes.STRING(500), allowNull: true },
      actedByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "acted_by_user_id"
      }
    },
    {
      sequelize,
      modelName: "HandicapAudit",
      tableName: "handicap_audits",
      updatedAt: false,
      indexes: [
        { fields: ["league_id", "entity_type", "entity_id"] },
        { fields: ["season_id", "created_at"] }
      ]
    }
  );
  return HandicapAudit;
}
