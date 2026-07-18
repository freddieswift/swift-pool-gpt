import {
  LeagueAdmin,
  Player,
  PlayerSanction,
  SanctionAppeal
} from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loadSanction = asyncHandler(async (req, _res, next) => {
  const sanction = await PlayerSanction.findByPk(req.params.sanctionId);
  if (!sanction) throw new ApiError(404, "Player sanction not found");

  const player = await Player.findByPk(sanction.playerId);
  if (!player) throw new ApiError(404, "Player not found");

  req.sanction = sanction;
  req.player = player;
  next();
});

export const loadAppeal = asyncHandler(async (req, _res, next) => {
  const appeal = await SanctionAppeal.findByPk(req.params.appealId);
  if (!appeal) throw new ApiError(404, "Sanction appeal not found");

  const sanction = await PlayerSanction.findByPk(appeal.sanctionId);
  if (!sanction) throw new ApiError(404, "Player sanction not found");

  const player = await Player.findByPk(sanction.playerId);
  if (!player) throw new ApiError(404, "Player not found");

  req.appeal = appeal;
  req.sanction = sanction;
  req.player = player;
  next();
});

export const requireSanctionLeagueAdmin = asyncHandler(
  async (req, _res, next) => {
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
  }
);
