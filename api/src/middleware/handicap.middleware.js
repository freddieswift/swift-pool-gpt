import {
  LeagueAdmin,
  PlayerHandicap,
  TeamHandicap
} from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadPlayerHandicap = asyncHandler(async (req, _res, next) => {
  const handicap = await PlayerHandicap.findByPk(req.params.handicapId);
  if (!handicap) throw new ApiError(404, "Player handicap not found");
  req.playerHandicap = handicap;
  next();
});

export const loadTeamHandicap = asyncHandler(async (req, _res, next) => {
  const handicap = await TeamHandicap.findByPk(req.params.handicapId);
  if (!handicap) throw new ApiError(404, "Team handicap not found");
  req.teamHandicap = handicap;
  next();
});

export const requireHandicapLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const handicap = req.playerHandicap || req.teamHandicap;
  const membership = await LeagueAdmin.findOne({
    where: { leagueId: handicap.leagueId, userId: req.user.id }
  });
  if (!membership) {
    throw new ApiError(403, "League administrator access required");
  }
  req.leagueAdminMembership = membership;
  next();
});
