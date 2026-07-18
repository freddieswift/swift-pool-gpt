import { DataTypes, Model } from "sequelize";

export class PlayerTransfer extends Model {}

export function initPlayerTransferModel(sequelize) {
  PlayerTransfer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      seasonId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "season_id"
      },
      playerId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "player_id"
      },
      fromSeasonTeamId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "from_season_team_id"
      },
      toSeasonTeamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "to_season_team_id"
      },
      effectiveDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "effective_date"
      },
      reason: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      createdByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "created_by_user_id"
      }
    },
    {
      sequelize,
      modelName: "PlayerTransfer",
      tableName: "player_transfers",
      updatedAt: false,
      indexes: [
        { fields: ["season_id", "player_id"] },
        { fields: ["to_season_team_id"] }
      ]
    }
  );

  return PlayerTransfer;
}
