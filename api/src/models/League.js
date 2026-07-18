import { DataTypes, Model } from "sequelize";

export class League extends Model {
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      isActive: this.isActive,
      createdByUserId: this.createdByUserId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initLeagueModel(sequelize) {
  League.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(140),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active"
      },
      createdByUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "created_by_user_id"
      }
    },
    {
      sequelize,
      modelName: "League",
      tableName: "leagues"
    }
  );

  return League;
}
