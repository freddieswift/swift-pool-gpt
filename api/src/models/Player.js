import { DataTypes, Model } from "sequelize";

export class Player extends Model {
  toJSON() {
    return {
      id: this.id,
      leagueId: this.leagueId,
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      email: this.email,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initPlayerModel(sequelize) {
  Player.init(
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
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true,
        field: "user_id"
      },
      firstName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: "first_name"
      },
      lastName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: "last_name"
      },
      displayName: {
        type: DataTypes.STRING(120),
        allowNull: false,
        field: "display_name"
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date_of_birth"
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active"
      }
    },
    {
      sequelize,
      modelName: "Player",
      tableName: "players",
      indexes: [
        { fields: ["league_id"] },
        { fields: ["league_id", "last_name", "first_name"] },
        { unique: true, fields: ["user_id"] }
      ]
    }
  );

  return Player;
}
