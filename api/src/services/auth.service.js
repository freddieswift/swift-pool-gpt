import { sequelize, User } from "../models/index.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const authService = {
  async register(payload) {
    return sequelize.transaction(async (transaction) => {
      const existing = await userRepository.findByEmail(payload.email, { transaction });
      if (existing) throw new ApiError(409, "An account with that email already exists");

      const user = await userRepository.create(
        {
          email: payload.email,
          passwordHash: payload.password,
          firstName: payload.firstName,
          lastName: payload.lastName,
          displayName: payload.displayName || null
        },
        { transaction }
      );

      return user.toSafeJSON();
    });
  },

  async authenticate(email, password) {
    const user = await userRepository.findByEmail(email, { includePassword: true });

    // Keep the public failure identical to reduce account enumeration.
    if (!user || !(await user.verifyPassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account is disabled");
    }

    await userRepository.updateLastLogin(user);
    return user;
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.scope("withPassword").findByPk(userId);
    if (!user || !(await user.verifyPassword(currentPassword))) {
      throw new ApiError(400, "Current password is incorrect");
    }

    user.passwordHash = newPassword;
    await user.save();
  },

  async updateProfile(user, payload) {
    await user.update(payload);
    return user.toSafeJSON();
  }
};
