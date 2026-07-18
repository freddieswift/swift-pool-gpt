import {
  League,
  LeagueAdmin,
  LEAGUE_ADMIN_ROLES,
  MatchFormat
} from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadLeague = asyncHandler(async (req, _res, next) => {
  const league = await League.findByPk(req.params.leagueId);

  if (!league) throw new ApiError(404, "League not found");

  req.league = league;
  next();
});

export const requireLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const membership = await LeagueAdmin.findOne({
    where: {
      leagueId: req.params.leagueId,
      userId: req.user.id
    }
  });

  if (!membership) throw new ApiError(403, "League administrator access required");

  req.leagueAdminMembership = membership;
  next();
});

export const requireLeagueOwner = asyncHandler(async (req, _res, next) => {
  const membership = await LeagueAdmin.findOne({
    where: {
      leagueId: req.params.leagueId,
      userId: req.user.id,
      role: LEAGUE_ADMIN_ROLES.OWNER
    }
  });

  if (!membership) throw new ApiError(403, "League owner access required");

  req.leagueAdminMembership = membership;
  next();
});

export const loadMatchFormat = asyncHandler(async (req, _res, next) => {
  const matchFormat = await MatchFormat.findByPk(req.params.matchFormatId);
  if (!matchFormat) throw new ApiError(404, "Match format not found");

  req.matchFormat = matchFormat;
  next();
});

export const requireMatchFormatLeagueAdmin = asyncHandler(async (req, _res, next) => {
  const membership = await LeagueAdmin.findOne({
    where: {
      leagueId: req.matchFormat.leagueId,
      userId: req.user.id
    }
  });

  if (!membership) throw new ApiError(403, "League administrator access required");

  req.leagueAdminMembership = membership;
  next();
});
