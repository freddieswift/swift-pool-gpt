import {
  LeagueAdmin,
  Player,
  Season,
  SeasonTeam,
  SeasonTeamPlayer
} from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadPlayer = asyncHandler(async (req, _res, next) => {
  const player = await Player.findByPk(req.params.playerId);
  if (!player) throw new ApiError(404, "Player not found");

  req.player = player;
  next();
});

export const requirePlayerLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const membership = await LeagueAdmin.findOne({
    where: {
      leagueId: req.player.leagueId,
      userId: req.user.id
    }
  });

  if (!membership) {
    throw new ApiError(403, "League administrator access required");
  }

  req.leagueAdminMembership = membership;
  next();
});

export const loadRosterEntry = asyncHandler(async (req, _res, next) => {
  const rosterEntry = await SeasonTeamPlayer.findByPk(req.params.rosterEntryId);
  if (!rosterEntry) throw new ApiError(404, "Roster entry not found");

  req.rosterEntry = rosterEntry;
  next();
});

export const requireRosterLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const seasonTeam = await SeasonTeam.findByPk(req.rosterEntry.seasonTeamId);
  if (!seasonTeam) throw new ApiError(404, "Season team not found");

  const season = await Season.findByPk(seasonTeam.seasonId);
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

  req.seasonTeam = seasonTeam;
  req.season = season;
  req.leagueAdminMembership = membership;
  next();
});
