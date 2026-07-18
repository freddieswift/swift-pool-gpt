import { Router } from "express";
import {
  calculatePlayerHandicaps,
  calculateTeamHandicaps,
  createPlayerHandicap,
  createTeamHandicap,
  listPlayerHandicapAudits,
  listPlayerHandicaps,
  listTeamHandicapAudits,
  listTeamHandicaps,
  updatePlayerHandicap,
  updateTeamHandicap
} from "../controllers/handicap.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadPlayerHandicap,
  loadTeamHandicap,
  requireHandicapLeagueAdmin
} from "../middleware/handicap.middleware.js";
import {
  loadPlayer,
  requirePlayerLeagueAdmin
} from "../middleware/player.middleware.js";
import {
  loadSeason,
  requireSeasonLeagueAdmin
} from "../middleware/season.middleware.js";
import {
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin
} from "../middleware/team.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  calculateHandicapSchema,
  createPlayerHandicapSchema,
  createTeamHandicapSchema,
  handicapIdParamsSchema,
  updateHandicapSchema
} from "../validators/handicap.validator.js";
import { playerIdParamsSchema } from "../validators/player.validator.js";
import { seasonIdParamsSchema } from "../validators/season.validator.js";
import { seasonTeamIdParamsSchema } from "../validators/team.validator.js";

export const playerHandicapRouter = Router({ mergeParams: true });
playerHandicapRouter.use(requireAuth);
playerHandicapRouter.get(
  "/",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  listPlayerHandicaps
);
playerHandicapRouter.post(
  "/",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  verifyCsrf,
  validate(createPlayerHandicapSchema),
  createPlayerHandicap
);
playerHandicapRouter.get(
  "/audits",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  listPlayerHandicapAudits
);

export const seasonTeamHandicapRouter = Router({ mergeParams: true });
seasonTeamHandicapRouter.use(requireAuth);
seasonTeamHandicapRouter.get(
  "/",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  listTeamHandicaps
);
seasonTeamHandicapRouter.post(
  "/",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  verifyCsrf,
  validate(createTeamHandicapSchema),
  createTeamHandicap
);
seasonTeamHandicapRouter.get(
  "/audits",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  listTeamHandicapAudits
);

export const seasonHandicapRouter = Router({ mergeParams: true });
seasonHandicapRouter.use(requireAuth);
seasonHandicapRouter.post(
  "/players/calculate",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(calculateHandicapSchema),
  calculatePlayerHandicaps
);
seasonHandicapRouter.post(
  "/teams/calculate",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(calculateHandicapSchema),
  calculateTeamHandicaps
);

export const playerHandicapRecordRouter = Router();
playerHandicapRecordRouter.use(requireAuth);
playerHandicapRecordRouter.patch(
  "/:handicapId",
  validate(handicapIdParamsSchema, "params"),
  loadPlayerHandicap,
  requireHandicapLeagueAdmin,
  verifyCsrf,
  validate(updateHandicapSchema),
  updatePlayerHandicap
);

export const teamHandicapRecordRouter = Router();
teamHandicapRecordRouter.use(requireAuth);
teamHandicapRecordRouter.patch(
  "/:handicapId",
  validate(handicapIdParamsSchema, "params"),
  loadTeamHandicap,
  requireHandicapLeagueAdmin,
  verifyCsrf,
  validate(updateHandicapSchema),
  updateTeamHandicap
);
