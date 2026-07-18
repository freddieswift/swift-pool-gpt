import { LeagueAdmin, Season } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadSeason = asyncHandler(async (req, _res, next) => {
  const season = await Season.findByPk(req.params.seasonId);
  if (!season) throw new ApiError(404, "Season not found");

  req.season = season;
  next();
});

export const requireSeasonLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const membership = await LeagueAdmin.findOne({
    where: {
      leagueId: req.season.leagueId,
      userId: req.user.id
    }
  });

  if (!membership) {
    throw new ApiError(403, "League administrator access required");
  }

  req.leagueAdminMembership = membership;
  next();
});
