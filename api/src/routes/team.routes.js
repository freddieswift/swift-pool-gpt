import { Router } from "express";
import {
  createTeam,
  deleteSeasonTeam,
  deleteTeam,
  getSeasonTeam,
  getTeam,
  listSeasonTeams,
  listTeams,
  registerSeasonTeam,
  updateSeasonTeam,
  updateTeam
} from "../controllers/team.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadLeague,
  requireLeagueAdmin
} from "../middleware/league.middleware.js";
import {
  loadSeason,
  requireSeasonLeagueAdmin
} from "../middleware/season.middleware.js";
import {
  loadSeasonTeam,
  loadTeam,
  requireSeasonTeamLeagueAdmin,
  requireTeamLeagueAdmin
} from "../middleware/team.middleware.js";
import { validate } from "../middleware/validate.js";
import { leagueIdParamsSchema } from "../validators/league.validator.js";
import { seasonIdParamsSchema } from "../validators/season.validator.js";
import {
  createTeamSchema,
  listTeamsQuerySchema,
  registerSeasonTeamSchema,
  seasonTeamIdParamsSchema,
  teamIdParamsSchema,
  updateSeasonTeamSchema,
  updateTeamSchema
} from "../validators/team.validator.js";

export const leagueTeamRouter = Router({ mergeParams: true });

leagueTeamRouter.use(requireAuth);
leagueTeamRouter.get(
  "/",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  validate(listTeamsQuerySchema, "query"),
  listTeams
);
leagueTeamRouter.post(
  "/",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  verifyCsrf,
  validate(createTeamSchema),
  createTeam
);

export const seasonTeamCollectionRouter = Router({ mergeParams: true });

seasonTeamCollectionRouter.use(requireAuth);
seasonTeamCollectionRouter.get(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  listSeasonTeams
);
seasonTeamCollectionRouter.post(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(registerSeasonTeamSchema),
  registerSeasonTeam
);

export const teamRouter = Router();

teamRouter.use(requireAuth);
teamRouter.get(
  "/:teamId",
  validate(teamIdParamsSchema, "params"),
  loadTeam,
  requireTeamLeagueAdmin,
  getTeam
);
teamRouter.patch(
  "/:teamId",
  validate(teamIdParamsSchema, "params"),
  loadTeam,
  requireTeamLeagueAdmin,
  verifyCsrf,
  validate(updateTeamSchema),
  updateTeam
);
teamRouter.delete(
  "/:teamId",
  validate(teamIdParamsSchema, "params"),
  loadTeam,
  requireTeamLeagueAdmin,
  verifyCsrf,
  deleteTeam
);

export const seasonTeamRouter = Router();

seasonTeamRouter.use(requireAuth);
seasonTeamRouter.get(
  "/:seasonTeamId",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  getSeasonTeam
);
seasonTeamRouter.patch(
  "/:seasonTeamId",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  verifyCsrf,
  validate(updateSeasonTeamSchema),
  updateSeasonTeam
);
seasonTeamRouter.delete(
  "/:seasonTeamId",
  validate(seasonTeamIdParamsSchema, "params"),
  loadSeasonTeam,
  requireSeasonTeamLeagueAdmin,
  verifyCsrf,
  deleteSeasonTeam
);
