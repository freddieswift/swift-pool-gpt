import {
  LeagueAdmin,
  Season,
  SeasonTransitionPlan
} from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadTransitionPlan = asyncHandler(async (req, _res, next) => {
  const plan = await SeasonTransitionPlan.findByPk(req.params.planId);
  if (!plan) throw new ApiError(404, "Season transition plan not found");

  const sourceSeason = await Season.findByPk(plan.sourceSeasonId);
  if (!sourceSeason) throw new ApiError(404, "Source season not found");

  req.transitionPlan = plan;
  req.transitionSourceSeason = sourceSeason;
  next();
});

export const requireTransitionLeagueAdmin = asyncHandler(
  async (req, _res, next) => {
    const membership = await LeagueAdmin.findOne({
      where: {
        leagueId: req.transitionSourceSeason.leagueId,
        userId: req.user.id
      }
    });

    if (!membership) {
      throw new ApiError(403, "League administrator access required");
    }

    req.leagueAdminMembership = membership;
    next();
  }
);
