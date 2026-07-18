import { LeagueAdmin, Match, Season } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadMatch = asyncHandler(async (req, _res, next) => {
  const match = await Match.findByPk(req.params.matchId);
  if (!match) throw new ApiError(404, "Match not found");
  req.match = match;
  next();
});

export const requireMatchLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const season = await Season.findByPk(req.match.seasonId);
  if (!season) throw new ApiError(404, "Season not found");

  const membership = await LeagueAdmin.findOne({
    where: { leagueId: season.leagueId, userId: req.user.id }
  });
  if (!membership) {
    throw new ApiError(403, "League administrator access required");
  }

  req.season = season;
  req.leagueAdminMembership = membership;
  next();
});
