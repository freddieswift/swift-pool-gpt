import { User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  if (!req.session?.userId) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await User.findByPk(req.session.userId);

  if (!user || !user.isActive) {
    req.session.destroy(() => {});
    throw new ApiError(401, "Session is no longer valid");
  }

  req.user = user;
  next();
});

export function requireSystemRole(...allowedRoles) {
  return (req, _res, next) => {
    const roles = req.session?.systemRoles ?? [];
    if (!allowedRoles.some((role) => roles.includes(role))) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    next();
  };
}

/*
 * League-admin and captain authorization should later query relationship tables:
 * league_admins and season_team_players.is_captain. Do not model those as a
 * single global role on users.
 */
