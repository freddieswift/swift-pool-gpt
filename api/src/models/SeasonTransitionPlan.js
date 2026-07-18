import { DataTypes, Model } from "sequelize";

export const TRANSITION_PLAN_STATUSES = Object.freeze({
  DRAFT: "DRAFT",
  APPROVED: "APPROVED",
  APPLIED: "APPLIED",
  CANCELLED: "CANCELLED"
});

export class SeasonTransitionPlan extends Model {
  toJSON() {
    return {
      id: this.id,
      sourceSeasonId: this.sourceSeasonId,
      targetSeasonId: this.targetSeasonId,
      status: this.status,
      notes: this.notes,
      approvedByUserId: this.approvedByUserId,
      approvedAt: this.approvedAt,
      appliedByUserId: this.appliedByUserId,
      appliedAt: this.appliedAt,
      createdByUserId: this.createdByUserId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initSeasonTransitionPlanModel(sequelize) {
  SeasonTransitionPlan.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      sourceSeasonId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "source_season_id"
      },
      targetSeasonId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "target_season_id"
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TRANSITION_PLAN_STATUSES)),
        allowNull: false,
        defaultValue: TRANSITION_PLAN_STATUSES.DRAFT
      },
      notes: { type: DataTypes.TEXT, allowNull: true },
      approvedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "approved_by_user_id"
      },
      approvedAt: { type: DataTypes.DATE, allowNull: true, field: "approved_at" },
      appliedByUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "applied_by_user_id"
      },
      appliedAt: { type: DataTypes.DATE, allowNull: true, field: "applied_at" },
      createdByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "created_by_user_id"
      }
    },
    {
      sequelize,
      modelName: "SeasonTransitionPlan",
      tableName: "season_transition_plans",
      indexes: [
        { fields: ["source_season_id", "status"] },
        { fields: ["target_season_id", "status"] }
      ]
    }
  );
  return SeasonTransitionPlan;
}
