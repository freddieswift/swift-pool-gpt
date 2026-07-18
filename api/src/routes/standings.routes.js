import { Router } from "express";
import {
  getDivisionStandings,
  getPlayerStatistics,
  getSeasonStandings,
  getSeasonSummary,
  getTeamStatistics
} from "../controllers/standings.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  loadDivision,
  requireDivisionLeagueAdmin
} from "../middleware/division.middleware.js";
import {
  loadSeason,
  requireSeasonLeagueAdmin
} from "../middleware/season.middleware.js";
import { validate } from "../middleware/validate.js";
import { divisionIdParamsSchema } from "../validators/division.validator.js";
import { seasonIdParamsSchema } from "../validators/season.validator.js";
import {
  standingsQuerySchema,
  statisticsQuerySchema
} from "../validators/standings.validator.js";

export const divisionStandingsRouter = Router({ mergeParams: true });

divisionStandingsRouter.use(requireAuth);
divisionStandingsRouter.get(
  "/",
  validate(divisionIdParamsSchema, "params"),
  loadDivision,
  requireDivisionLeagueAdmin,
  validate(standingsQuerySchema, "query"),
  getDivisionStandings
);

export const seasonStandingsRouter = Router({ mergeParams: true });

seasonStandingsRouter.use(requireAuth);
seasonStandingsRouter.get(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(standingsQuerySchema, "query"),
  getSeasonStandings
);
seasonStandingsRouter.get(
  "/statistics/teams",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(statisticsQuerySchema, "query"),
  getTeamStatistics
);
seasonStandingsRouter.get(
  "/statistics/players",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(statisticsQuerySchema, "query"),
  getPlayerStatistics
);
seasonStandingsRouter.get(
  "/summary",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  getSeasonSummary
);
