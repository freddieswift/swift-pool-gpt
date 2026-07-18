import {
  LeagueAdmin,
  Season,
  SeasonTeam,
  Team
} from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadTeam = asyncHandler(async (req, _res, next) => {
  const team = await Team.findByPk(req.params.teamId);
  if (!team) throw new ApiError(404, "Team not found");

  req.team = team;
  next();
});

export const requireTeamLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const membership = await LeagueAdmin.findOne({
    where: {
      leagueId: req.team.leagueId,
      userId: req.user.id
    }
  });

  if (!membership) {
    throw new ApiError(403, "League administrator access required");
  }

  req.leagueAdminMembership = membership;
  next();
});

export const loadSeasonTeam = asyncHandler(async (req, _res, next) => {
  const seasonTeam = await SeasonTeam.findByPk(req.params.seasonTeamId);
  if (!seasonTeam) throw new ApiError(404, "Season team not found");

  req.seasonTeam = seasonTeam;
  next();
});

export const requireSeasonTeamLeagueAdmin = asyncHandler(
  async (req, _res, next) => {
    const season = await Season.findByPk(req.seasonTeam.seasonId);
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
  }
);
