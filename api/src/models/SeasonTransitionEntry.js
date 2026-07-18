import { DataTypes, Model } from "sequelize";

export const TRANSITION_ACTIONS = Object.freeze({
  PROMOTE: "PROMOTE",
  RELEGATE: "RELEGATE",
  RETAIN: "RETAIN",
  UNASSIGNED: "UNASSIGNED"
});

export class SeasonTransitionEntry extends Model {
  toJSON() {
    return {
      id: this.id,
      planId: this.planId,
      teamId: this.teamId,
      sourceSeasonTeamId: this.sourceSeasonTeamId,
      sourceDivisionId: this.sourceDivisionId,
      targetDivisionId: this.targetDivisionId,
      sourcePosition: this.sourcePosition,
      action: this.action,
      seed: this.seed,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initSeasonTransitionEntryModel(sequelize) {
  SeasonTransitionEntry.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      planId: { type: DataTypes.UUID, allowNull: false, field: "plan_id" },
      teamId: { type: DataTypes.UUID, allowNull: false, field: "team_id" },
      sourceSeasonTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "source_season_team_id"
      },
      sourceDivisionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "source_division_id"
      },
      targetDivisionId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "target_division_id"
      },
      sourcePosition: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: "source_position"
      },
      action: {
        type: DataTypes.ENUM(...Object.values(TRANSITION_ACTIONS)),
        allowNull: false
      },
      seed: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      notes: { type: DataTypes.STRING(1000), allowNull: true }
    },
    {
      sequelize,
      modelName: "SeasonTransitionEntry",
      tableName: "season_transition_entries",
      indexes: [
        { unique: true, fields: ["plan_id", "team_id"] },
        { fields: ["target_division_id"] }
      ]
    }
  );
  return SeasonTransitionEntry;
}
