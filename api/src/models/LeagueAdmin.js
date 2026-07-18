import { DataTypes, Model } from "sequelize";

export const LEAGUE_ADMIN_ROLES = Object.freeze({
  OWNER: "OWNER",
  ADMIN: "ADMIN"
});

export class LeagueAdmin extends Model {}

export function initLeagueAdminModel(sequelize) {
  LeagueAdmin.init(
    {
      leagueId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: "league_id"
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: "user_id"
      },
      role: {
        type: DataTypes.ENUM(...Object.values(LEAGUE_ADMIN_ROLES)),
        allowNull: false,
        defaultValue: LEAGUE_ADMIN_ROLES.ADMIN
      }
    },
    {
      sequelize,
      modelName: "LeagueAdmin",
      tableName: "league_admins"
    }
  );

  return LeagueAdmin;
}
