import { Router } from "express";
import {
  addRosterPlayer,
  createPlayer,
  deletePlayer,
  deleteRosterPlayer,
  getPlayer,
  listPlayerTransfers,
  listPlayers,
  listRoster,
  transferRosterPlayer,
  updatePlayer,
  updateRosterPlayer
} from "../controllers/player.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadLeague,
  requireLeagueAdmin
} from "../middleware/league.middleware.js";
import {
  loadPlayer,
  loadRosterEntry,
  requirePlayerLeagueAdmin,
  requireRosterLeagueAdmin
} from "../middleware/player.middleware.js";
import {
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin
} from "../middleware/team.middleware.js";
import { validate } from "../middleware/validate.js";
import { leagueIdParamsSchema } from "../validators/league.validator.js";
import {
  addRosterPlayerSchema,
  createPlayerSchema,
  listPlayersQuerySchema,
  playerIdParamsSchema,
  rosterEntryIdParamsSchema,
  transferPlayerSchema,
  updatePlayerSchema,
  updateRosterPlayerSchema
} from "../validators/player.validator.js";
import { seasonTeamIdParamsSchema } from "../validators/team.validator.js";

export const leaguePlayerRouter = Router({ mergeParams: true });

leaguePlayerRouter.use(requireAuth);
leaguePlayerRouter.get(
  "/",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  validate(listPlayersQuerySchema, "query"),
  listPlayers
);
leaguePlayerRouter.post(
  "/",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  verifyCsrf,
  validate(createPlayerSchema),
  createPlayer
);

export const seasonTeamRosterRouter = Router({ mergeParams: true });

seasonTeamRosterRouter.use(requireAuth);
seasonTeamRosterRouter.get(
  "/",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  listRoster
);
seasonTeamRosterRouter.post(
  "/",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  verifyCsrf,
  validate(addRosterPlayerSchema),
  addRosterPlayer
);

export const playerRouter = Router();

playerRouter.use(requireAuth);
playerRouter.get(
  "/:playerId",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  getPlayer
);
playerRouter.patch(
  "/:playerId",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  verifyCsrf,
  validate(updatePlayerSchema),
  updatePlayer
);
playerRouter.delete(
  "/:playerId",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  verifyCsrf,
  deletePlayer
);
playerRouter.get(
  "/:playerId/transfers",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  listPlayerTransfers
);

export const rosterEntryRouter = Router();

rosterEntryRouter.use(requireAuth);
rosterEntryRouter.patch(
  "/:rosterEntryId",
  validate(rosterEntryIdParamsSchema, "params"),
  loadRosterEntry,
  requireRosterLeagueAdmin,
  verifyCsrf,
  validate(updateRosterPlayerSchema),
  updateRosterPlayer
);
rosterEntryRouter.post(
  "/:rosterEntryId/transfer",
  validate(rosterEntryIdParamsSchema, "params"),
  loadRosterEntry,
  requireRosterLeagueAdmin,
  verifyCsrf,
  validate(transferPlayerSchema),
  transferRosterPlayer
);
rosterEntryRouter.delete(
  "/:rosterEntryId",
  validate(rosterEntryIdParamsSchema, "params"),
  loadRosterEntry,
  requireRosterLeagueAdmin,
  verifyCsrf,
  deleteRosterPlayer
);
