import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export class User extends Model {
  async verifyPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      isActive: this.isActive,
      emailVerifiedAt: this.emailVerifiedAt,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export function initUserModel(sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(value) {
          this.setDataValue("email", value.trim().toLowerCase());
        }
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash"
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
        allowNull: true,
        field: "display_name"
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active"
      },
      emailVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "email_verified_at"
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "last_login_at"
      }
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      defaultScope: {
        attributes: { exclude: ["passwordHash"] }
      },
      scopes: {
        withPassword: {
          attributes: { include: ["passwordHash"] }
        }
      },
      hooks: {
        beforeCreate: async (user) => {
          if (user.passwordHash) {
            user.passwordHash = await bcrypt.hash(user.passwordHash, env.BCRYPT_ROUNDS);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("passwordHash")) {
            user.passwordHash = await bcrypt.hash(user.passwordHash, env.BCRYPT_ROUNDS);
          }
        }
      }
    }
  );

  return User;
}
