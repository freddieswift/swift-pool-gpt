import { Division, LeagueAdmin, Season } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadDivision = asyncHandler(async (req, _res, next) => {
  const division = await Division.findByPk(req.params.divisionId);
  if (!division) throw new ApiError(404, "Division not found");

  req.division = division;
  next();
});

export const requireDivisionLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const season = await Season.findByPk(req.division.seasonId);
  if (!season) throw new ApiError(404, "Season not found");

  const membership = await LeagueAdmin.findOne({
    where: {
      leagueId: season.leagueId,
      userId: req.user.id
    }
  });

  if (!membership) {
    throw new ApiError(403, "League administrator access required");
  }

  req.season = season;
  req.leagueAdminMembership = membership;
  next();
});
