import { DataTypes, Model } from "sequelize";

export class Team extends Model {
  toJSON() {
    return {
      id: this.id,
      leagueId: this.leagueId,
      name: this.name,
      shortName: this.shortName,
      slug: this.slug,
      venueName: this.venueName,
      venueAddress: this.venueAddress,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initTeamModel(sequelize) {
  Team.init(
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
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      shortName: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: "short_name"
      },
      slug: {
        type: DataTypes.STRING(140),
        allowNull: false
      },
      venueName: {
        type: DataTypes.STRING(160),
        allowNull: true,
        field: "venue_name"
      },
      venueAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "venue_address"
      },
      contactEmail: {
        type: DataTypes.STRING(254),
        allowNull: true,
        field: "contact_email"
      },
      contactPhone: {
        type: DataTypes.STRING(40),
        allowNull: true,
        field: "contact_phone"
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
      modelName: "Team",
      tableName: "teams",
      indexes: [
        { fields: ["league_id"] },
        { unique: true, fields: ["league_id", "slug"] },
        { unique: true, fields: ["league_id", "name"] }
      ]
    }
  );

  return Team;
}
