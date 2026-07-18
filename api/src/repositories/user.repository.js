import { User } from "../models/index.js";

export const userRepository = {
  findById(id, options = {}) {
    return User.findByPk(id, options);
  },

  findByEmail(email, { includePassword = false, transaction } = {}) {
    const scope = includePassword ? "withPassword" : "defaultScope";
    return User.scope(scope).findOne({
      where: { email: email.trim().toLowerCase() },
      transaction
    });
  },

  create(data, options = {}) {
    return User.create(data, options);
  },

  async updateLastLogin(user, transaction) {
    user.lastLoginAt = new Date();
    return user.save({ transaction });
  }
};
