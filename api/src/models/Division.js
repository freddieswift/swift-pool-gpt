import { DataTypes, Model } from "sequelize";

export class Division extends Model {
  toJSON() {
    return {
      id: this.id,
      seasonId: this.seasonId,
      name: this.name,
      slug: this.slug,
      position: this.position,
      promotionPlaces: this.promotionPlaces,
      relegationPlaces: this.relegationPlaces,
      isActive: this.isActive,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initDivisionModel(sequelize) {
  Division.init(
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
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(140),
        allowNull: false
      },
      position: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      promotionPlaces: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: "promotion_places"
      },
      relegationPlaces: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: "relegation_places"
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active"
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Division",
      tableName: "divisions",
      indexes: [
        { fields: ["season_id"] },
        { unique: true, fields: ["season_id", "slug"] },
        { unique: true, fields: ["season_id", "position"] }
      ]
    }
  );

  return Division;
}
